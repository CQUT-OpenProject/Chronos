import type { Course } from '@chronos/core';
import {
	campusIdToShareIndex,
	getCampusDefaultPeriodTimes,
	resolveShareCampusId,
	shareIndexToCampusId,
	type CqutCampusId
} from '$lib/models/cqut-campus';
import {
	CURRENT_TIMETABLE_SCHEMA_VERSION,
	TimetableImportSource,
	normalizeTimetableName,
	type Timetable
} from '$lib/models/timetable';
import { coursePalette, normalizedCourseName } from '@chronos/core';
import { consolidateCourses } from '$lib/parsers/import-course-utils';
import {
	formatLocation,
	isEmptyRoom,
	NO_BUILDING,
	parseLocation,
	readRoomBytes,
	ROOM_BYTE_LENGTH,
	writeRoomBytes
} from './location-codec';
import { VarintReader, writeVarint } from './varint';
import { WeekMaskTable } from './week-mask-table';
import { NO_TEACHER_SLOT, TeacherTable } from './teacher-table';
import { assertValidWeeks, MAX_WEEK } from './week-bitmask';
import { ShareBinaryDecodeError } from './share-binary-decode-error';

const MAGIC = [0x43, 0x53] as const;
const VERSION = 0x01;
const TERM_EPOCH = Date.UTC(2020, 0, 1);
const DEFAULT_END_WEEK = 20;
const MAX_STRINGS = 255;
const MAX_COURSES = 255;

const FLAG_HAS_REMARKS = 1 << 0;
const FLAG_CUSTOM_END_WEEK = 1 << 1;
const FLAG_GLOBAL_WEEK_MASK = 1 << 2;
const FLAG_SINGLE_BUILDING = 1 << 3;

interface StringPool {
	strings: string[];
	indexOf: Map<string, number>;
}

interface EncodedCourse {
	nameIdx: number;
	dayPeriod: number;
	endTeacher: number;
	buildingIdx: number;
	room: string;
	weekMaskIdx: number;
	remarkIdx: number;
	isSplitLocation: boolean;
}

function dateToDaysSinceEpoch(isoDate: string): number {
	const [year, month, day] = isoDate.split('-').map((part) => Number.parseInt(part, 10));
	if (!year || !month || !day) throw new ShareBinaryDecodeError('invalid term start date');
	const millis = Date.UTC(year, month - 1, day);
	return Math.floor((millis - TERM_EPOCH) / 86_400_000);
}

function daysSinceEpochToDate(days: number): string {
	const date = new Date(TERM_EPOCH + days * 86_400_000);
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function createStringPool(timetableName: string): StringPool {
	const strings = [timetableName];
	const indexOf = new Map<string, number>([[timetableName, 0]]);
	return { strings, indexOf };
}

function internString(pool: StringPool, value: string): number {
	const trimmed = value.trim();
	if (!trimmed) return -1;
	const existing = pool.indexOf.get(trimmed);
	if (existing !== undefined) return existing;
	if (pool.strings.length >= MAX_STRINGS) {
		throw new ShareBinaryDecodeError('string table overflow');
	}
	const index = pool.strings.length;
	pool.strings.push(trimmed);
	pool.indexOf.set(trimmed, index);
	return index;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function writeStringTable(pool: StringPool, target: number[]): void {
	target.push(pool.strings.length);
	for (const value of pool.strings) {
		const bytes = textEncoder.encode(value);
		writeVarint(bytes.length, target);
		for (const byte of bytes) target.push(byte);
	}
}

function readStringTable(
	bytes: Uint8Array,
	offset: number
): { strings: string[]; nextOffset: number } {
	const count = bytes[offset];
	if (count === undefined) throw new ShareBinaryDecodeError('truncated string table');
	const strings: string[] = [];
	const reader = new VarintReader(bytes);
	reader.position = offset + 1;
	for (let index = 0; index < count; index += 1) {
		const length = reader.read();
		const start = reader.position;
		const slice = bytes.subarray(start, start + length);
		if (slice.length !== length) throw new ShareBinaryDecodeError('truncated string entry');
		strings.push(textDecoder.decode(slice));
		reader.position = start + length;
	}
	return { strings, nextOffset: reader.position };
}

function packDayPeriod(dayOfWeek: number, startPeriod: number, hasRemark: boolean): number {
	return ((dayOfWeek & 0x07) << 5) | (((startPeriod - 1) & 0x0f) << 1) | (hasRemark ? 1 : 0);
}

function unpackDayPeriod(byte: number): {
	dayOfWeek: number;
	startPeriod: number;
	hasRemark: boolean;
} {
	const dayOfWeek = (byte >> 5) & 0x07;
	const startPeriod = ((byte >> 1) & 0x0f) + 1;
	const hasRemark = (byte & 1) === 1;
	return { dayOfWeek, startPeriod, hasRemark };
}

function packEndTeacher(endPeriod: number, teacherSlot: number): number {
	return ((endPeriod & 0x0f) << 4) | (teacherSlot & 0x0f);
}

function unpackEndTeacher(byte: number): { endPeriod: number; teacherSlot: number } {
	return { endPeriod: (byte >> 4) & 0x0f, teacherSlot: byte & 0x0f };
}

function encodeLocation(pool: StringPool, location: string): { buildingIdx: number; room: string } {
	const parsed = parseLocation(location);
	if (parsed.kind === 'full') {
		if (!parsed.value) return { buildingIdx: NO_BUILDING, room: '' };
		return { buildingIdx: internString(pool, parsed.value), room: '' };
	}
	return {
		buildingIdx: internString(pool, parsed.building),
		room: parsed.room
	};
}

function decodeLocation(strings: string[], buildingIdx: number, room: string): string {
	if (buildingIdx === NO_BUILDING) return '';
	const building = strings[buildingIdx] ?? '';
	if (!building) return '';
	if (isEmptyRoom(room)) return building;
	return formatLocation({ kind: 'split', building, room });
}

function normalizeTimetable(timetable: Timetable): Timetable {
	return {
		...timetable,
		name: normalizeTimetableName(timetable.name),
		courses: consolidateCourses(
			timetable.courses.map((course) => ({
				...course,
				name: normalizedCourseName(course.name),
				teacher: course.teacher.trim(),
				location: course.location.trim(),
				remark: course.remark?.trim() ?? ''
			}))
		)
	};
}

function applyShareImportCampus(
	timetable: Timetable,
	campusId: CqutCampusId
): Pick<Timetable, 'academicConfig' | 'importMetadata'> {
	return {
		academicConfig: {
			...timetable.academicConfig,
			periodTimes: getCampusDefaultPeriodTimes(campusId)
		},
		importMetadata: {
			source: TimetableImportSource.SHARED_JSON,
			campusId
		}
	};
}

export function encodeTimetableToBinary(timetable: Timetable): Uint8Array {
	const normalized = normalizeTimetable(timetable);
	if (normalized.courses.length === 0) {
		throw new ShareBinaryDecodeError('timetable has no courses');
	}
	if (normalized.courses.length > MAX_COURSES) {
		throw new ShareBinaryDecodeError('too many courses');
	}

	const pool = createStringPool(normalized.name);
	const weekMaskTable = new WeekMaskTable();
	const teacherTable = new TeacherTable();
	const endWeek = normalized.academicConfig.endWeek || DEFAULT_END_WEEK;
	if (endWeek > MAX_WEEK) {
		throw new ShareBinaryDecodeError(`week out of range: ${endWeek}`);
	}
	const hasRemarks = normalized.courses.some((course) => (course.remark?.length ?? 0) > 0);

	const firstWeeks = normalized.courses[0]?.weeks ?? [];
	const globalWeekMask =
		normalized.courses.length > 0 &&
		normalized.courses.every(
			(course) =>
				course.weeks.length === firstWeeks.length &&
				course.weeks.every((week, index) => week === firstWeeks[index])
		);
	const globalWeekMaskIdx = globalWeekMask ? weekMaskTable.intern(firstWeeks) : -1;

	const encodedCourses: EncodedCourse[] = normalized.courses.map((course) => {
		if (!course.name) throw new ShareBinaryDecodeError('course name is required');
		assertValidWeeks(course.weeks);
		const nameIdx = internString(pool, course.name);
		const teacherSlot = teacherTable.intern(course.teacher);
		const remarkIdx = course.remark ? internString(pool, course.remark) : -1;
		const location = encodeLocation(pool, course.location);
		const parsed = parseLocation(course.location);
		return {
			nameIdx,
			dayPeriod: packDayPeriod(course.dayOfWeek, course.startPeriod, remarkIdx >= 0),
			endTeacher: packEndTeacher(course.endPeriod, teacherSlot > 0 ? teacherSlot : NO_TEACHER_SLOT),
			buildingIdx: location.buildingIdx,
			room: location.room,
			weekMaskIdx: globalWeekMask ? globalWeekMaskIdx : weekMaskTable.intern(course.weeks),
			remarkIdx,
			isSplitLocation: parsed.kind === 'split'
		};
	});

	let singleBuildingIdx = -1;
	for (const course of encodedCourses) {
		if (!course.isSplitLocation || course.buildingIdx === NO_BUILDING) continue;
		if (singleBuildingIdx === -1) {
			singleBuildingIdx = course.buildingIdx;
		} else if (singleBuildingIdx !== course.buildingIdx) {
			singleBuildingIdx = -1;
			break;
		}
	}
	const flags =
		(hasRemarks ? FLAG_HAS_REMARKS : 0) |
		(endWeek !== DEFAULT_END_WEEK ? FLAG_CUSTOM_END_WEEK : 0) |
		(globalWeekMask ? FLAG_GLOBAL_WEEK_MASK : 0) |
		(singleBuildingIdx >= 0 ? FLAG_SINGLE_BUILDING : 0);
	const campusIdx = campusIdToShareIndex(
		resolveShareCampusId(normalized.importMetadata.campusId, normalized.courses)
	);

	const bytes: number[] = [...MAGIC, VERSION, flags];
	const termDays = dateToDaysSinceEpoch(normalized.academicConfig.termStartDate);
	bytes.push(termDays & 0xff, (termDays >> 8) & 0xff);
	if ((flags & FLAG_CUSTOM_END_WEEK) !== 0) bytes.push(endWeek);
	bytes.push(normalized.courses.length);
	if ((flags & FLAG_SINGLE_BUILDING) !== 0) bytes.push(singleBuildingIdx);
	bytes.push(campusIdx);

	writeStringTable(pool, bytes);
	weekMaskTable.write(bytes);
	teacherTable.write(bytes);

	for (const course of encodedCourses) bytes.push(course.nameIdx);
	for (const course of encodedCourses) bytes.push(course.dayPeriod);
	for (const course of encodedCourses) bytes.push(course.endTeacher);
	if ((flags & FLAG_SINGLE_BUILDING) === 0) {
		for (const course of encodedCourses) bytes.push(course.buildingIdx);
	}
	for (const course of encodedCourses) writeRoomBytes(course.room, bytes);
	if ((flags & FLAG_GLOBAL_WEEK_MASK) === 0) {
		for (const course of encodedCourses) bytes.push(course.weekMaskIdx);
	}
	if ((flags & FLAG_HAS_REMARKS) !== 0) {
		for (const course of encodedCourses) {
			bytes.push(course.remarkIdx >= 0 ? course.remarkIdx : 0);
		}
	}

	return Uint8Array.from(bytes);
}

export function decodeBinaryToTimetable(bytes: Uint8Array, now = Date.now()): Timetable {
	if (bytes.length < 6) throw new ShareBinaryDecodeError('payload too short');
	if (bytes[0] !== MAGIC[0] || bytes[1] !== MAGIC[1]) {
		throw new ShareBinaryDecodeError('invalid magic');
	}
	if (bytes[2] !== VERSION) throw new ShareBinaryDecodeError('unsupported version');

	const flags = bytes[3]!;
	const termDays = bytes[4]! | (bytes[5]! << 8);
	let offset = 6;
	let endWeek = DEFAULT_END_WEEK;
	if ((flags & FLAG_CUSTOM_END_WEEK) !== 0) {
		endWeek = bytes[offset];
		if (endWeek === undefined) throw new ShareBinaryDecodeError('truncated header');
		offset += 1;
	}

	const courseCount = bytes[offset];
	if (courseCount === undefined || courseCount === 0) {
		throw new ShareBinaryDecodeError('no courses in payload');
	}
	offset += 1;

	let singleBuildingIdx = -1;
	if ((flags & FLAG_SINGLE_BUILDING) !== 0) {
		singleBuildingIdx = bytes[offset];
		if (singleBuildingIdx === undefined) throw new ShareBinaryDecodeError('truncated header');
		offset += 1;
	}

	const campusIdx = bytes[offset];
	if (campusIdx === undefined) throw new ShareBinaryDecodeError('truncated header');
	offset += 1;
	const campusId = shareIndexToCampusId(campusIdx);

	const { strings, nextOffset: stringTableEnd } = readStringTable(bytes, offset);
	offset = stringTableEnd;
	const { table: weekMaskTable, nextOffset: weekMaskEnd } = WeekMaskTable.read(bytes, offset);
	offset = weekMaskEnd;
	const { table: teacherTable, nextOffset: teacherEnd } = TeacherTable.read(bytes, offset);
	offset = teacherEnd;

	const nameColOffset = offset;
	offset += courseCount;
	const dayPeriodColOffset = offset;
	offset += courseCount;
	const endTeacherColOffset = offset;
	offset += courseCount;

	const hasSingleBuilding = (flags & FLAG_SINGLE_BUILDING) !== 0;
	const buildingColOffset = offset;
	if (!hasSingleBuilding) offset += courseCount;

	const roomColumnOffset = offset;
	offset += courseCount * ROOM_BYTE_LENGTH;

	const hasGlobalWeekMask = (flags & FLAG_GLOBAL_WEEK_MASK) !== 0;
	const weekMaskColOffset = offset;
	if (!hasGlobalWeekMask) offset += courseCount;
	const globalWeekMaskIdx = hasGlobalWeekMask ? 0 : -1;

	const hasRemarks = (flags & FLAG_HAS_REMARKS) !== 0;
	const remarkColOffset = offset;
	if (hasRemarks) offset += courseCount;

	if (bytes.length < offset) {
		throw new ShareBinaryDecodeError('truncated course columns');
	}

	const timetableName = normalizeTimetableName(strings[0] ?? '');
	const courses: Course[] = [];

	for (let index = 0; index < courseCount; index += 1) {
		const nameIdx = bytes[nameColOffset + index]!;
		const dayPeriod = bytes[dayPeriodColOffset + index]!;
		const endTeacher = bytes[endTeacherColOffset + index]!;
		const buildingIdx = hasSingleBuilding ? singleBuildingIdx : bytes[buildingColOffset + index]!;
		const weekMaskIdx =
			globalWeekMaskIdx >= 0 ? globalWeekMaskIdx : bytes[weekMaskColOffset + index]!;
		const remarkIdx = hasRemarks ? (bytes[remarkColOffset + index] ?? 0) : 0;

		const room = readRoomBytes(bytes, roomColumnOffset + index * ROOM_BYTE_LENGTH);
		const { dayOfWeek, startPeriod } = unpackDayPeriod(dayPeriod);
		const { endPeriod, teacherSlot } = unpackEndTeacher(endTeacher);
		const name = strings[nameIdx];
		if (!name) throw new ShareBinaryDecodeError('invalid course name index');

		const [color, textColor] = coursePalette(name);
		courses.push({
			id: `share-course-${index + 1}`,
			name,
			teacher:
				teacherSlot === NO_TEACHER_SLOT || teacherSlot === 0
					? ''
					: teacherTable.decode(teacherSlot),
			location: decodeLocation(strings, buildingIdx, room),
			dayOfWeek,
			startPeriod,
			endPeriod: Math.max(startPeriod, endPeriod),
			color,
			textColor,
			weeks: weekMaskTable.decode(weekMaskIdx),
			remark: remarkIdx > 0 ? (strings[remarkIdx] ?? '') : ''
		});
	}

	if (courses.length === 0) throw new ShareBinaryDecodeError('no valid courses decoded');

	const sortedCourses = courses.sort(
		(left, right) =>
			left.dayOfWeek - right.dayOfWeek ||
			left.startPeriod - right.startPeriod ||
			left.name.localeCompare(right.name)
	);

	const baseTimetable: Timetable = {
		schemaVersion: CURRENT_TIMETABLE_SCHEMA_VERSION,
		id: 'share-import',
		name: timetableName,
		courses: sortedCourses,
		createdAt: now,
		updatedAt: now,
		academicConfig: {
			termStartDate: daysSinceEpochToDate(termDays),
			startWeek: 1,
			endWeek,
			periodTimes: []
		},
		importMetadata: { source: TimetableImportSource.SHARED_JSON },
		viewPrefs: {
			showSaturday: courses.some((course) => course.dayOfWeek === 6),
			showSunday: courses.some((course) => course.dayOfWeek === 7),
			showNonCurrentWeekCourses: false
		}
	};

	const campusFields = applyShareImportCampus(baseTimetable, campusId);
	return {
		...baseTimetable,
		...campusFields
	};
}

export { ShareBinaryDecodeError } from './share-binary-decode-error';
