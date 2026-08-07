import type { PeriodTime } from '$lib/models/timetable';
import type { TimetableCourseDisplayModel } from '$lib/models/presentation';

export const MIN_TIME_REFRESH_DELAY_MILLIS = 1_000;

export interface ParsedPeriodRange {
	index: number;
	startMinutes: number;
	endMinutes: number;
}

export interface SlotPosition {
	dayOfWeek: number;
	startPeriod: number;
	endPeriod: number;
}

export interface CourseSlotGroup {
	dayOfWeek: number;
	startPeriod: number;
	endPeriod: number;
	courses: TimetableCourseDisplayModel[];
	position: SlotPosition;
}

const DAY_LABELS = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const DAY_SHORT_LABELS = ['', '一', '二', '三', '四', '五', '六', '日'];

export function timetableDayLabel(dayOfWeek: number): string {
	return DAY_LABELS[dayOfWeek] ?? '未知';
}

export function timetableDayShortLabel(dayOfWeek: number): string {
	return DAY_SHORT_LABELS[dayOfWeek] ?? '?';
}

export function parseColor(hex: string): string {
	const normalized = hex.trim();
	return /^#[0-9A-Fa-f]{6}$/.test(normalized) ? normalized : '#EADDFF';
}

export function parsePeriodRanges(periods: PeriodTime[]): ParsedPeriodRange[] {
	return [...periods]
		.map((period) => ({
			index: period.index,
			startMinutes: parseTimeMinutes(period.startTime),
			endMinutes: parseTimeMinutes(period.endTime)
		}))
		.sort((left, right) => left.index - right.index);
}

export function findCurrentPeriodIndex(
	periods: ParsedPeriodRange[],
	nowMinutes: number
): number | null {
	const active = periods.find(
		(period) => nowMinutes >= period.startMinutes && nowMinutes <= period.endMinutes
	);
	if (active) return active.index;

	const upcoming = periods.find((period) => nowMinutes < period.startMinutes);
	if (upcoming) return upcoming.index;

	return periods.at(-1)?.index ?? null;
}

export function computeDelayUntilNextCurrentTimeRefreshMillis(
	now: Date,
	periods: ParsedPeriodRange[],
	minimumDelayMillis = MIN_TIME_REFRESH_DELAY_MILLIS
): number {
	const nowMinutes = now.getHours() * 60 + now.getMinutes();
	const nextBoundaryToday = periods.reduce<number | null>((found, period) => {
		if (found != null) return found;
		if (nowMinutes >= period.startMinutes && nowMinutes <= period.endMinutes) {
			return period.endMinutes;
		}
		if (nowMinutes < period.startMinutes) {
			return period.startMinutes;
		}
		return null;
	}, null);

	const nextBoundary =
		nextBoundaryToday != null
			? boundaryToDate(now, nextBoundaryToday, nowMinutes)
			: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

	return Math.max(nextBoundary.getTime() - now.getTime(), minimumDelayMillis);
}

export function buildSlotGroups(
	courseDisplayModels: TimetableCourseDisplayModel[]
): CourseSlotGroup[] {
	const byDay = new Map<number, TimetableCourseDisplayModel[]>();
	for (const model of courseDisplayModels) {
		const day = model.course.dayOfWeek;
		const list = byDay.get(day) ?? [];
		list.push(model);
		byDay.set(day, list);
	}

	return [...byDay.entries()]
		.sort(([left], [right]) => left - right)
		.flatMap(([, dayCourses]) => buildDaySlotGroups(dayCourses));
}

export interface LocationParts {
	campus: string;
	building: string;
	room: string;
}

/** Split a location into campus / building / room for capsule display. */
export function parseLocationParts(location: string): LocationParts {
	const tokens = location.trim().split(/\s+/).filter(Boolean);
	const campusTokens: string[] = [];
	const otherTokens: string[] = [];
	for (const token of tokens) {
		if (token.endsWith('校区')) campusTokens.push(token);
		else otherTokens.push(token);
	}

	const campus = campusTokens.join('');
	const remainder = otherTokens.join('');
	if (!remainder) {
		return { campus, building: '', room: '' };
	}

	// Building name + room code glued or spaced (e.g. 弘远楼A0213, 第一教学楼A101).
	const match = remainder.match(/^(.*?)([A-Za-z]+[0-9][A-Za-z0-9]*|[0-9]+[A-Za-z0-9]*)$/);
	if (!match) {
		return { campus, building: remainder, room: '' };
	}

	return {
		campus,
		building: match[1] ?? '',
		room: match[2] ?? ''
	};
}

/** Non-empty capsule lines: campus, building, room (in that order). */
export function locationDisplayLines(location: string): string[] {
	const { campus, building, room } = parseLocationParts(location);
	return [campus, building, room].filter((part) => part.length > 0);
}

export function blendColors(background: string, surface: string, ratio: number): string {
	const bg = hexToRgb(background);
	const sf = hexToRgb(surface);
	if (!bg || !sf) return background;
	const mix = (left: number, right: number) => Math.round(left * (1 - ratio) + right * ratio);
	return rgbToHex(mix(bg.r, sf.r), mix(bg.g, sf.g), mix(bg.b, sf.b));
}

export function currentTimeMinutes(date: Date): number {
	return date.getHours() * 60 + date.getMinutes();
}

function buildDaySlotGroups(sortedCourses: TimetableCourseDisplayModel[]): CourseSlotGroup[] {
	if (sortedCourses.length === 0) return [];

	const sorted = [...sortedCourses].sort(
		(left, right) =>
			left.course.startPeriod - right.course.startPeriod ||
			left.course.endPeriod - right.course.endPeriod ||
			left.course.name.localeCompare(right.course.name)
	);

	const groups: CourseSlotGroup[] = [];
	let current: TimetableCourseDisplayModel[] = [];
	let currentEndPeriod = 0;

	for (const displayModel of sorted) {
		const course = displayModel.course;
		if (current.length === 0 || course.startPeriod <= currentEndPeriod) {
			current.push(displayModel);
			currentEndPeriod = Math.max(currentEndPeriod, course.endPeriod);
		} else {
			groups.push(toCourseSlotGroup(current));
			current = [displayModel];
			currentEndPeriod = course.endPeriod;
		}
	}

	if (current.length > 0) {
		groups.push(toCourseSlotGroup(current));
	}

	return groups;
}

function toCourseSlotGroup(courses: TimetableCourseDisplayModel[]): CourseSlotGroup {
	const dayOfWeek = courses[0]!.course.dayOfWeek;
	const startPeriod = Math.min(...courses.map((entry) => entry.course.startPeriod));
	const endPeriod = Math.max(...courses.map((entry) => entry.course.endPeriod));
	return {
		dayOfWeek,
		startPeriod,
		endPeriod,
		courses,
		position: { dayOfWeek, startPeriod, endPeriod }
	};
}

function parseTimeMinutes(value: string): number {
	const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
	if (!match) return 0;
	return Number(match[1]) * 60 + Number(match[2]);
}

function boundaryToDate(now: Date, boundaryMinutes: number, nowMinutes: number): Date {
	const hours = Math.floor(boundaryMinutes / 60);
	const minutes = boundaryMinutes % 60;
	const candidate = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		hours,
		minutes,
		0,
		0
	);
	if (candidate.getTime() <= now.getTime() && boundaryMinutes <= nowMinutes) {
		candidate.setDate(candidate.getDate() + 1);
	}
	return candidate;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const normalized = parseColor(hex).slice(1);
	const value = Number.parseInt(normalized, 16);
	if (Number.isNaN(value)) return null;
	return {
		r: (value >> 16) & 255,
		g: (value >> 8) & 255,
		b: value & 255
	};
}

function rgbToHex(r: number, g: number, b: number): string {
	return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}
