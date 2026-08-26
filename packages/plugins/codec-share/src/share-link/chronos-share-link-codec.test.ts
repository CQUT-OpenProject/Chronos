import { describe, expect, it } from 'vite-plus/test';
import type { Course } from '@chronos/core';
import { createTimetable } from '@chronos/core';
import { bitmaskToWeeks, deflateRaw, inflateRaw, weeksToBitmask } from '@chronos/codec-kit';
import { decodeBinaryToTimetable, encodeTimetableToBinary } from './chronos-share-binary';
import { parseLocation } from './location-codec';
import { WeekMaskTable } from './week-mask-table';
import {
	decodeSharePayload,
	encodeShareLink,
	encodeSharePayload,
	estimateShareLinkLength,
	extractSharePayloadFromLocation,
	extractSharePayloadFromText,
	formatShareClipboardText,
	SHARE_LINK_CORRUPTED_MESSAGE,
	SHARE_LINK_PREFIX_DEFLATE
} from './chronos-share-link-codec';

describe('week-bitmask', () => {
	it('round-trips contiguous and sparse weeks', () => {
		expect(
			bitmaskToWeeks(weeksToBitmask([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]))
		).toEqual(Array.from({ length: 16 }, (_, index) => index + 1));
		expect(bitmaskToWeeks(weeksToBitmask([1, 3, 5]))).toEqual([1, 3, 5]);
		expect(bitmaskToWeeks(weeksToBitmask([32]))).toEqual([32]);
	});
});

describe('location-codec', () => {
	it('splits CQUT building and room', () => {
		expect(parseLocation('两江校区 弘远楼D0429')).toEqual({
			kind: 'split',
			building: '两江校区 弘远楼',
			room: 'D0429'
		});
		expect(parseLocation('两江操场14')).toEqual({
			kind: 'full',
			value: '两江操场14'
		});
	});
});

describe('week-mask-table', () => {
	it('encodes contiguous ranges and sparse bitmasks', () => {
		const table = new WeekMaskTable();
		const rangeIndex = table.intern([6, 7, 8, 9, 10, 11]);
		expect(table.entries[rangeIndex]).toEqual([0x80 | 6, 11]);
		expect(table.decode(rangeIndex)).toEqual([6, 7, 8, 9, 10, 11]);

		const sparseIndex = table.intern([1, 3, 5]);
		expect(table.decode(sparseIndex)).toEqual([1, 3, 5]);
	});

	it('escapes bitmasks that collide with range encoding', () => {
		const table = new WeekMaskTable();
		const escapedIndex = table.intern([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17]);
		expect(table.entries[escapedIndex]).toHaveLength(4);
		expect(table.decode(escapedIndex)).toEqual([
			2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17
		]);
	});
});

describe('chronos-share-binary', () => {
	it('round-trips a sample timetable', () => {
		const timetable = sampleTimetable();
		const decoded = decodeBinaryToTimetable(encodeTimetableToBinary(timetable), 42);
		expect(decoded.name).toBe(timetable.name);
		expect(decoded.academicConfig.termStartDate).toBe('2026-03-02');
		expect(decoded.academicConfig.endWeek).toBe(20);
		expect(decoded.importMetadata!.source).toBe('share-link');
		expect(decoded.importMetadata!.campusId).toBe('liangjiang');
		expect(decoded.academicConfig.periodTimes[0]?.startTime).toBe('08:30');
		expect(decoded.courses[0]).toMatchObject({
			name: '编译原理',
			teacher: '张老师',
			location: 'B201',
			dayOfWeek: 6,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1, 2, 3],
			remark: '带教材第 3 版'
		});
	});

	it('round-trips explicit huaxi campus', () => {
		const timetable = createTimetable({
			...sampleTimetable(),
			importMetadata: { source: 'cqut-online', campusId: 'huaxi' }
		});
		const decoded = decodeBinaryToTimetable(encodeTimetableToBinary(timetable));
		expect(decoded.importMetadata!.campusId).toBe('huaxi');
		expect(decoded.academicConfig.periodTimes[0]?.startTime).toBe('08:20');
	});

	it('infers huaxi campus from course locations when exporting', () => {
		const timetable = createTimetable({
			...sampleTimetable(),
			courses: [
				course('c1', '编译原理', '张老师', {
					location: '花溪校区 至善楼A101',
					dayOfWeek: 6,
					weeks: [1, 2, 3]
				})
			]
		});
		const decoded = decodeBinaryToTimetable(encodeTimetableToBinary(timetable));
		expect(decoded.importMetadata!.campusId).toBe('huaxi');
		expect(decoded.academicConfig.periodTimes[0]?.startTime).toBe('08:20');
	});

	it('defaults to liangjiang campus when no campus info is available', () => {
		const timetable = sampleTimetable();
		const decoded = decodeBinaryToTimetable(encodeTimetableToBinary(timetable));
		expect(decoded.importMetadata!.campusId).toBe('liangjiang');
		expect(decoded.academicConfig.periodTimes[0]?.startTime).toBe('08:30');
	});

	it('handles timetable with empty or missing termStartDate gracefully', () => {
		const timetable = createTimetable({
			id: 'empty-start-date',
			name: '未设起始日课表',
			courses: [
				course('c1', '高等数学', '王老师', {
					location: '两江校区 弘远楼A101',
					dayOfWeek: 1,
					weeks: [1, 2, 3]
				})
			]
		});
		expect(timetable.academicConfig.termStartDate).toBe('');
		const decoded = decodeBinaryToTimetable(encodeTimetableToBinary(timetable));
		expect(decoded.name).toBe('未设起始日课表');
		expect(decoded.academicConfig.termStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it('rejects weeks beyond the supported range', () => {
		const timetable = sampleTimetable();
		timetable.courses[0]!.weeks = [33];
		expect(() => encodeTimetableToBinary(timetable)).toThrow(/week out of range/);
	});

	it('round-trips split CQUT locations', () => {
		const timetable = createTimetable({
			id: 'cqut',
			name: '2026-2027-1',
			courses: [
				course('c1', '数据库原理及应用', '朱烨华', {
					location: '两江校区 弘远楼D0429',
					weeks: [6, 7, 8, 9, 10, 11]
				})
			],
			createdAt: 1,
			updatedAt: 1,
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 21,
				periodTimes: []
			},
			importMetadata: { source: 'share-link' }
		});

		const decoded = decodeBinaryToTimetable(encodeTimetableToBinary(timetable));
		expect(decoded.courses[0]?.location).toBe('两江校区 弘远楼D0429');
	});

	it('deduplicates shared teachers in the string table', () => {
		const timetable = createTimetable({
			id: 't1',
			name: '测试课表',
			courses: [
				course('c1', '课程甲', '李老师'),
				course('c2', '课程乙', '李老师'),
				course('c3', '课程丙', '李老师')
			],
			createdAt: 1,
			updatedAt: 1,
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			},
			importMetadata: { source: 'share-link' }
		});

		const binary = encodeTimetableToBinary(timetable);
		const decoded = decodeBinaryToTimetable(binary);
		expect(decoded.courses.every((entry) => entry.teacher === '李老师')).toBe(true);
		expect(binary.length).toBeLessThan(
			encodeTimetableToBinary({
				...timetable,
				courses: timetable.courses.map((entry, index) => ({
					...entry,
					teacher: `独立教师${index}`
				}))
			}).length
		);
	});
});

describe('chronos-share-link-codec', () => {
	it('round-trips share payload and link', async () => {
		const timetable = sampleTimetable();
		const payload = await encodeSharePayload(timetable);
		expect(payload.startsWith(SHARE_LINK_PREFIX_DEFLATE)).toBe(true);

		const decoded = await decodeSharePayload(payload);
		expect(decoded.ok).toBe(true);
		if (!decoded.ok) return;
		expect(decoded.value.courses[0]?.name).toBe('编译原理');
		expect(decoded.value.importMetadata!.campusId).toBe('liangjiang');
		expect(decoded.value.academicConfig.periodTimes[0]?.startTime).toBe('08:30');

		const link = await encodeShareLink(timetable, 'https://chronos.test');
		expect(link).toBe(`https://chronos.test/s#${payload}`);
	});

	it('rejects invalid versions and truncated payloads', async () => {
		expect((await decodeSharePayload('2.abcd')).ok).toBe(false);
		expect((await decodeSharePayload('1!!!')).ok).toBe(false);

		const payload = await encodeSharePayload(sampleTimetable());
		const mutations = [
			payload.slice(0, -1),
			payload.slice(0, -3),
			payload.slice(0, Math.floor(payload.length / 2)) +
				payload.slice(Math.floor(payload.length / 2) + 1),
			payload.slice(0, 50) + 'X' + payload.slice(51),
			payload.slice(0, Math.floor(payload.length / 2))
		];

		for (const mutated of mutations) {
			expect((await decodeSharePayload(mutated)).ok).toBe(false);
		}
	});

	it('rejects checksum mismatches with a clear message', async () => {
		const payload = await encodeSharePayload(sampleTimetable());
		const compressed = base64UrlToTestBytes(payload.slice(SHARE_LINK_PREFIX_DEFLATE.length));
		const inflated = await inflateRaw(compressed);
		inflated[inflated.length - 1]! ^= 0x01;
		const tampered = `${SHARE_LINK_PREFIX_DEFLATE}${bytesToTestBase64Url(await deflateRaw(inflated))}`;
		const decoded = await decodeSharePayload(tampered);

		expect(decoded.ok).toBe(false);
		if (decoded.ok) return;
		expect(decoded.errorMessage).toBe(SHARE_LINK_CORRUPTED_MESSAGE);
	});

	it('extracts payload from hash and query', () => {
		const payload = '1.abc';
		expect(
			extractSharePayloadFromLocation({
				hash: `#${payload}`,
				search: '',
				pathname: '/s'
			} as Location)
		).toBe(payload);
		expect(
			extractSharePayloadFromLocation({
				hash: '',
				search: `?d=${payload}`,
				pathname: '/s'
			} as Location)
		).toBe(payload);
	});

	it('extracts payload from clipboard text', () => {
		const payload = '1.abc';
		expect(extractSharePayloadFromText(payload)).toBe(payload);
		expect(extractSharePayloadFromText(`https://chronos.test/s#${payload}`)).toBe(payload);
		expect(extractSharePayloadFromText(`https://chronos.test/s?d=${payload}`)).toBe(payload);
		expect(extractSharePayloadFromText('not-a-share-link')).toBeNull();
	});

	it('formats and extracts share clipboard text', () => {
		const link = 'https://chronos.test/s#1.abc';
		const clipboardText = formatShareClipboardText('知行理工', link);
		expect(clipboardText).toBe(
			'我分享了一张课表：「知行理工」\n复制这段文本后，打开 Chronos，选择从【分享链接】方式导入\nhttps://chronos.test/s#1.abc'
		);
		expect(extractSharePayloadFromText(clipboardText)).toBe('1.abc');
		expect(formatShareClipboardText('', link)).toContain('「未命名课表」');
	});

	it('keeps 15-course payload under 520 characters', async () => {
		const timetable = createLargeTimetable(15);
		const payload = await encodeSharePayload(timetable);
		expect(payload.length).toBeLessThan(520);
		expect(await estimateShareLinkLength(timetable)).toBe(payload.length);
	});

	it('round-trips CQUT sparse week patterns from production import', async () => {
		const timetable = createTimetable({
			id: 'cqut-sparse',
			name: '知行理工',
			courses: [
				course('c1', '移动开发技术及应用', '杨承玉', {
					location: '两江校区 弘远楼A0409',
					dayOfWeek: 5,
					startPeriod: 1,
					endPeriod: 2,
					weeks: [6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18]
				}),
				course('c2', '物联网感知与控制技术', '但远宏', {
					location: '两江校区 弘远楼D0426',
					dayOfWeek: 2,
					startPeriod: 3,
					endPeriod: 4,
					weeks: [11, 12, 14, 15, 16, 17, 18, 19]
				}),
				course('c3', '形势与政策5', '董璇', {
					location: '两江校区 弘远楼B0315',
					dayOfWeek: 3,
					startPeriod: 1,
					endPeriod: 2,
					weeks: [3, 4, 5, 6]
				})
			],
			createdAt: 1,
			updatedAt: 1,
			academicConfig: {
				termStartDate: '2026-08-31',
				startWeek: 1,
				endWeek: 21,
				periodTimes: []
			},
			importMetadata: { source: 'share-link' }
		});

		const decoded = await decodeSharePayload(await encodeSharePayload(timetable));
		expect(decoded.ok).toBe(true);
		if (!decoded.ok) return;
		expect(decoded.value.courses).toHaveLength(3);
		const byName = Object.fromEntries(decoded.value.courses.map((entry) => [entry.name, entry]));
		expect(byName['移动开发技术及应用']?.weeks).toEqual([
			6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18
		]);
		expect(byName['物联网感知与控制技术']?.weeks).toEqual([11, 12, 14, 15, 16, 17, 18, 19]);
		expect(byName['形势与政策5']?.weeks).toEqual([3, 4, 5, 6]);
		expect(byName['形势与政策5']?.teacher).toBe('董璇');
	});

	it('keeps 25-course CQUT payload under 740 characters', async () => {
		const timetable = createCqutLargeTimetable();
		const payload = await encodeSharePayload(timetable);
		expect(payload.length).toBeLessThan(740);
		const decoded = await decodeSharePayload(payload);
		expect(decoded.ok).toBe(true);
		if (!decoded.ok) return;
		expect(decoded.value.courses).toHaveLength(25);
		expect(decoded.value.courses[0]?.location).toBe('两江校区 弘远楼D0429');
	});
});

function bytesToTestBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToTestBytes(value: string): Uint8Array {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	const binary = atob(padded);
	return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function course(id: string, name: string, teacher: string, overrides: Partial<Course> = {}) {
	return {
		id,
		name,
		teacher,
		location: 'A101',
		dayOfWeek: 1,
		startPeriod: 1,
		endPeriod: 2,
		color: '#EADDFF',
		textColor: '#21005D',
		weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
		remark: '',
		...overrides
	};
}

function sampleTimetable() {
	return createTimetable({
		id: 't1',
		name: '2025-2026学年第2学期',
		courses: [
			course('c1', '编译原理', '张老师', {
				location: 'B201',
				dayOfWeek: 6,
				remark: '带教材第 3 版',
				weeks: [1, 2, 3]
			})
		],
		createdAt: 1,
		updatedAt: 1,
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		},
		importMetadata: { source: 'share-link' },
		viewPrefs: {
			showSaturday: true,
			showSunday: false,
			showNonCurrentWeekCourses: false
		}
	});
}

function createLargeTimetable(count: number) {
	const teachers = ['张老师', '李老师', '王老师', '赵老师', '刘老师'];
	const locations = [
		'两江校区 弘远楼A0401',
		'两江校区 弘远楼A0402',
		'两江校区 弘远楼A0409',
		'两江校区 弘远楼B0315',
		'两江校区 弘远楼D0429'
	];
	const names = [
		'编译原理',
		'数据结构',
		'操作系统',
		'计算机网络',
		'数据库原理',
		'软件工程',
		'人工智能',
		'机器学习',
		'线性代数',
		'概率统计',
		'大学英语',
		'马克思主义',
		'体育',
		'形势与政策',
		'创新创业'
	];

	return createTimetable({
		id: 'large',
		name: '2025-2026学年第2学期',
		courses: Array.from({ length: count }, (_, index) =>
			course(
				`c${index + 1}`,
				names[index] ?? `课程${index + 1}`,
				teachers[index % teachers.length]!,
				{
					location: locations[index % locations.length]!,
					dayOfWeek: (index % 7) + 1,
					startPeriod: (index % 8) + 1,
					endPeriod: (index % 8) + 2,
					weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				}
			)
		),
		createdAt: 1,
		updatedAt: 1,
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		},
		importMetadata: { source: 'share-link' }
	});
}

function createCqutLargeTimetable() {
	const buildingCourses = [
		['数据库原理及应用', '朱烨华', '两江校区 弘远楼D0429', 1, 1, 2, [6, 7, 8, 9, 10, 11]],
		['数据库原理及应用', '朱烨华', '两江校区 弘远楼A0402', 3, 3, 4, [6, 7, 8, 9, 10, 11]],
		['移动开发技术及应用', '杨承玉', '两江校区 弘远楼A0409', 3, 3, 4, [15, 16, 17, 18]],
		['操作系统', '杨承玉', '两江校区 弘远楼A0213', 3, 5, 6, [6, 7, 8, 9, 10, 11, 12]],
		['物联网通信技术', '王东', '两江校区 弘远楼D0429', 3, 7, 8, [3, 4, 5, 6, 7, 8, 9, 10]],
		['深度学习（双语）', '王伟', '两江校区 弘远楼A0311', 3, 9, 10, [2, 3, 4, 5, 6, 7, 8, 9]],
		[
			'毛泽东思想和中国特色社会主义理论体系概论',
			'李老师',
			'两江校区 弘远楼B0315',
			4,
			3,
			4,
			[2, 3, 4, 5, 6]
		],
		['物联网感知与控制技术', '王东', '两江校区 弘远楼D0426', 4, 3, 4, [11, 12, 13, 14, 15]],
		[
			'数据库原理及应用',
			'朱烨华',
			'两江校区 弘远楼B0415',
			4,
			7,
			8,
			[2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
		],
		['物联网感知与控制技术', '王东', '两江校区 弘远楼A0409', 4, 7, 8, [16, 17, 18, 19]],
		['物联网通信技术', '王东', '两江校区 弘远楼D0236', 4, 9, 10, [2, 3, 4, 5, 6, 7, 8, 9]],
		[
			'数据库原理及应用',
			'朱烨华',
			'两江校区 弘远楼B0415',
			1,
			3,
			4,
			[2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
		],
		[
			'移动开发技术及应用',
			'杨承玉',
			'两江校区 弘远楼A0409',
			5,
			1,
			2,
			[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
		],
		['深度学习（双语）', '王伟', '两江校区 弘远楼A0409', 5, 3, 4, [2, 3, 4, 5]],
		[
			'移动开发技术及应用',
			'杨承玉',
			'两江校区 弘远楼D0425',
			5,
			3,
			4,
			[6, 7, 8, 9, 10, 11, 12, 13, 14]
		],
		[
			'操作系统',
			'杨承玉',
			'两江校区 弘远楼A0401',
			5,
			5,
			6,
			[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
		],
		[
			'操作系统',
			'杨承玉',
			'两江校区 弘远楼A0213',
			5,
			7,
			8,
			[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
		],
		['深度学习（双语）', '王伟', '两江校区 弘远楼A0311', 5, 9, 10, [2, 3, 4, 5]],
		[
			'物联网感知与控制技术',
			'王东',
			'两江校区 弘远楼D0426',
			2,
			3,
			4,
			[11, 12, 13, 14, 15, 16, 17, 18, 19]
		],
		['物联网通信技术', '王东', '两江校区 弘远楼D0236', 2, 3, 4, [2, 3, 4, 5, 6, 7, 8, 9]],
		[
			'毛泽东思想和中国特色社会主义理论体系概论',
			'李老师',
			'两江校区 弘远楼B0315',
			2,
			5,
			6,
			[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
		],
		['深度学习（双语）', '王伟', '两江校区 弘远楼A0311', 2, 7, 8, [6, 7, 8, 9]],
		[
			'物联网感知与控制技术',
			'王东',
			'两江校区 弘远楼A0409',
			2,
			7,
			8,
			[11, 12, 13, 14, 15, 16, 17, 18, 19]
		],
		['深度学习（双语）', '王伟', '两江校区 弘远楼A0409', 2, 9, 10, [6, 7, 8, 9]],
		['形势与政策5', '赵老师', '两江校区 弘远楼B0315', 3, 1, 2, [3, 4, 5, 6]]
	] as const;

	return createTimetable({
		id: 'cqut-large',
		name: '2026-2027-1',
		courses: buildingCourses.map(
			([name, teacher, location, dayOfWeek, startPeriod, endPeriod, weeks], index) =>
				course(`c${index + 1}`, name, teacher, {
					location,
					dayOfWeek,
					startPeriod,
					endPeriod,
					weeks: [...weeks]
				})
		),
		createdAt: 1,
		updatedAt: 1,
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 21,
			periodTimes: []
		},
		importMetadata: { source: 'share-link' }
	});
}
