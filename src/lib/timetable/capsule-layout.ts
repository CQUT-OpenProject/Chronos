import type { Course } from '$lib/models/course';
import { TimetableLayoutMode } from '$lib/models/app-state';
import type { TimetableCourseDisplayModel } from '$lib/models/presentation';
import {
	COURSE_PALETTE_ENTRIES,
	assignCourseDisplayColors,
	normalizedCourseName,
	resolveCoursePaint,
	type CoursePaletteEntry
} from '$lib/parsers/course-palette';
import { periodSlotKey } from './slot-key';

const BADGE_LABEL = '非本周';

/** Hide “xx校区” when effective column width is below this. */
export const HIDE_LOCATION_CAMPUS_BELOW_PX = 70;

/** Fit layout: one tier smaller than scroll (title/detail/badge floors = narrowest anchors). */
const FIT_TITLE_DELTA = 2;
const FIT_DETAIL_DELTA = 1;
const FIT_BADGE_DELTA = 1;
const MIN_TITLE_PX = 12;
const MIN_DETAIL_PX = 8;
const MIN_BADGE_PX = 8;

export interface CapsuleTypeScale {
	titlePx: number;
	detailPx: number;
	badgePx: number;
	placeholderPx: number;
}

export interface CapsuleGeometry {
	leftPercent: number;
	widthPercent: number;
	startPeriod: number;
	endPeriod: number;
}

export interface PlacedCourseCapsule {
	kind: 'course';
	key: string;
	course: Course;
	displayModel: TimetableCourseDisplayModel;
	geometry: CapsuleGeometry;
	colors: { background: string; text: string };
	scale: CapsuleTypeScale;
	locationLines: string[];
	locationMetrics: { fontPx: number; heightPx: number };
	teacher: string;
	badgeLabel: string | null;
	overlapCount: number;
}

export interface PlacedOverlapPlaceholder {
	kind: 'overlap-placeholder';
	key: string;
	geometry: CapsuleGeometry;
	count: number;
	placeholderPx: number;
}

export type PlacedItem = PlacedCourseCapsule | PlacedOverlapPlaceholder;

export interface PlaceCapsulesInput {
	courseDisplayModels: TimetableCourseDisplayModel[];
	visibleDays: { dayOfWeek: number }[];
	columnWidthPx: number;
	expandedSlotKeys: ReadonlySet<string>;
	layoutMode?: TimetableLayoutMode;
	coursePalette?: readonly CoursePaletteEntry[];
	paletteCourses?: { name: string; color: string }[];
}

interface CourseSlotGroup {
	dayOfWeek: number;
	startPeriod: number;
	endPeriod: number;
	courses: TimetableCourseDisplayModel[];
}

interface LocationParts {
	campus: string;
	building: string;
	room: string;
}

/** leading-tight ≈ 1.25 — used to reserve location height in px. */
const LOCATION_LINE_HEIGHT_RATIO = 1.25;
/** Extra px for building/room when campus row is dropped. */
const LOCATION_FONT_BUMP_PX = 2;

const TITLE_ANCHORS: ReadonlyArray<readonly [number, number]> = [
	[50, 12],
	[70, 14],
	[85, 15],
	[110, 17]
];

const DETAIL_ANCHORS: ReadonlyArray<readonly [number, number]> = [
	[50, 8],
	[70, 10],
	[85, 11],
	[110, 12]
];

const BADGE_ANCHORS: ReadonlyArray<readonly [number, number]> = [
	[50, 8],
	[70, 9],
	[85, 10],
	[110, 12]
];

/**
 * Place course capsules (and overlap placeholders) for one week grid body.
 * UI renders the result; DOM fitting (truncate / fitFont) stays across the seam.
 */
export function placeCapsules(input: PlaceCapsulesInput): PlacedItem[] {
	const {
		courseDisplayModels,
		visibleDays,
		columnWidthPx,
		expandedSlotKeys,
		layoutMode = TimetableLayoutMode.SCROLL,
		coursePalette = COURSE_PALETTE_ENTRIES,
		paletteCourses
	} = input;
	const compact = layoutMode === TimetableLayoutMode.FIT;
	const visibleDayCount = visibleDays.length;
	if (visibleDayCount === 0) return [];
	const paletteByName = assignCourseDisplayColors(
		paletteCourses ?? courseDisplayModels.map((model) => model.course),
		coursePalette
	);

	const visibleDayIndexMap = new Map(visibleDays.map((day, index) => [day.dayOfWeek, index]));
	const columnFraction = 100 / visibleDayCount;
	const items: PlacedItem[] = [];

	for (const group of buildSlotGroups(courseDisplayModels)) {
		const key = periodSlotKey(group.dayOfWeek, group.startPeriod, group.endPeriod);
		const count = group.courses.length;
		const columnIndex = visibleDayIndexMap.get(group.dayOfWeek) ?? 0;
		const columnLeft = columnIndex * columnFraction;

		if (count === 1) {
			const displayModel = group.courses[0]!;
			items.push(
				placeCourseCapsule({
					displayModel,
					columnLeft,
					widthPercent: columnFraction,
					columnWidthPx,
					overlapCount: 1,
					coursePalette,
					paletteByName,
					compact,
					key: `${key}:${displayModel.course.id}`
				})
			);
			continue;
		}

		if (!expandedSlotKeys.has(key)) {
			const scale = resolveCapsuleTypeScale(columnWidthPx, 1, compact);
			items.push({
				kind: 'overlap-placeholder',
				key,
				geometry: {
					leftPercent: columnLeft,
					widthPercent: columnFraction,
					startPeriod: group.startPeriod,
					endPeriod: group.endPeriod
				},
				count,
				placeholderPx: scale.placeholderPx
			});
			continue;
		}

		const perCourseWidth = columnFraction / count;
		group.courses.forEach((displayModel, index) => {
			items.push(
				placeCourseCapsule({
					displayModel,
					columnLeft: columnLeft + perCourseWidth * index,
					widthPercent: perCourseWidth,
					columnWidthPx,
					overlapCount: count,
					coursePalette,
					paletteByName,
					compact,
					key: `${key}:${displayModel.course.id}`
				})
			);
		});
	}

	return items;
}

function placeCourseCapsule(options: {
	displayModel: TimetableCourseDisplayModel;
	columnLeft: number;
	widthPercent: number;
	columnWidthPx: number;
	overlapCount: number;
	coursePalette: readonly CoursePaletteEntry[];
	paletteByName: Map<string, CoursePaletteEntry>;
	compact: boolean;
	key: string;
}): PlacedCourseCapsule {
	const {
		displayModel,
		columnLeft,
		widthPercent,
		columnWidthPx,
		overlapCount,
		coursePalette,
		paletteByName,
		compact,
		key
	} = options;
	const course = displayModel.course;
	const showCampus = shouldShowLocationCampus(columnWidthPx, overlapCount);
	const locationLines = locationDisplayLines(course.location, { includeCampus: showCampus });
	const scale = resolveCapsuleTypeScale(columnWidthPx, overlapCount, compact);
	const locationMetrics = resolveLocationBlockMetrics(
		scale.detailPx,
		showCampus,
		locationLines.length
	);

	return {
		kind: 'course',
		key,
		course,
		displayModel,
		geometry: {
			leftPercent: columnLeft,
			widthPercent,
			startPeriod: course.startPeriod,
			endPeriod: course.endPeriod
		},
		colors: courseColors(course, coursePalette, paletteByName),
		scale,
		locationLines,
		locationMetrics,
		teacher: course.teacher.trim(),
		badgeLabel: displayModel.isInDisplayedWeek ? null : BADGE_LABEL,
		overlapCount
	};
}
export function shouldShowLocationCampus(columnWidthPx: number, overlapCount = 1): boolean {
	const overlap = Math.max(1, overlapCount);
	const effective = Math.max(0, columnWidthPx) / overlap;
	return effective >= HIDE_LOCATION_CAMPUS_BELOW_PX;
}

/**
 * Location block sizing: when campus is hidden for width, keep a 3-line slot
 * (so the course title does not grow) and bump building/room type size.
 */
export function resolveLocationBlockMetrics(
	detailPx: number,
	showCampus: boolean,
	visibleLineCount: number
): { fontPx: number; heightPx: number } {
	const reservedLines = showCampus ? Math.min(Math.max(visibleLineCount, 1), 3) : 3;
	const fontPx = roundPx(showCampus ? detailPx : detailPx + LOCATION_FONT_BUMP_PX);
	const heightPx = reservedLines * detailPx * LOCATION_LINE_HEIGHT_RATIO;
	return { fontPx, heightPx };
}

/**
 * Map column content width (+ overlap) to capsule type sizes.
 * `columnWidthPx` is one day column; overlap narrows the effective width.
 * `compact` (fit layout) subtracts one fixed tier from each size.
 */
export function resolveCapsuleTypeScale(
	columnWidthPx: number,
	overlapCount = 1,
	compact = false
): CapsuleTypeScale {
	const overlap = Math.max(1, overlapCount);
	const effective = Math.max(0, columnWidthPx) / overlap;

	let titlePx = roundPx(lerpAnchors(effective, TITLE_ANCHORS));
	let detailPx = roundPx(lerpAnchors(effective, DETAIL_ANCHORS));
	let badgePx = roundPx(lerpAnchors(effective, BADGE_ANCHORS));

	if (compact) {
		titlePx = Math.max(MIN_TITLE_PX, roundPx(titlePx - FIT_TITLE_DELTA));
		detailPx = Math.max(MIN_DETAIL_PX, roundPx(detailPx - FIT_DETAIL_DELTA));
		badgePx = Math.max(MIN_BADGE_PX, roundPx(badgePx - FIT_BADGE_DELTA));
	}

	const placeholderPx = roundPx(Math.max(11, titlePx - 1));

	return { titlePx, detailPx, badgePx, placeholderPx };
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
export function locationDisplayLines(
	location: string,
	options?: { includeCampus?: boolean }
): string[] {
	const { campus, building, room } = parseLocationParts(location);
	const includeCampus = options?.includeCampus !== false;
	const parts = includeCampus ? [campus, building, room] : [building, room];
	return parts.filter((part) => part.length > 0);
}

export function parseColor(hex: string): string {
	const normalized = hex.trim();
	return /^#[0-9A-Fa-f]{6}$/.test(normalized) ? normalized : '#EADDFF';
}

function courseColors(
	course: Course,
	coursePalette: readonly CoursePaletteEntry[],
	paletteByName: Map<string, CoursePaletteEntry>
): { background: string; text: string } {
	const paint =
		paletteByName.get(normalizedCourseName(course.name)) ??
		resolveCoursePaint(course, coursePalette);
	return {
		background: parseColor(paint.background),
		text: parseColor(paint.foreground)
	};
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
		courses
	};
}

function lerpAnchors(
	effectivePx: number,
	anchors: ReadonlyArray<readonly [number, number]>
): number {
	const first = anchors[0]!;
	const last = anchors[anchors.length - 1]!;
	if (effectivePx <= first[0]) return first[1];
	if (effectivePx >= last[0]) return last[1];

	for (let index = 1; index < anchors.length; index += 1) {
		const [x0, y0] = anchors[index - 1]!;
		const [x1, y1] = anchors[index]!;
		if (effectivePx <= x1) {
			const t = (effectivePx - x0) / (x1 - x0);
			return y0 + t * (y1 - y0);
		}
	}
	return last[1];
}

function roundPx(value: number): number {
	return Math.round(value * 10) / 10;
}
