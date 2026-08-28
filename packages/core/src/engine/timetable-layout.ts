import type { Timetable } from '../domain/timetable';
import type { CapsuleCornerStyle, TimetableLayoutMode } from '../domain/preferences';
import { AcademicCalendarService, formatWeekDateRange } from './calendar';
import { calculateTimetableGrid, type TimetableGridModel } from './grid';
import {
	buildTimetableCourseDisplayModels,
	type TimetableCourseDisplayModel
} from './display-models';
import { placeCapsules, type PlacedItem } from './capsule-layout';
import { COURSE_PALETTE_ENTRIES, type CoursePaletteEntry } from './palette';

export interface TimetableWeekLayoutInput {
	timetable: Timetable;
	displayedWeek: number;
	todayIso: string;
	columnWidthPx?: number;
	expandedSlotKeys?: ReadonlySet<string>;
	layoutMode?: TimetableLayoutMode;
	capsuleCornerStyle?: CapsuleCornerStyle;
	coursePalette?: readonly CoursePaletteEntry[];
	paletteCourses?: { name: string; color?: string }[];
	academicCalendarService?: AcademicCalendarService;
}

export interface TimetableWeekLayoutResult {
	gridModel: TimetableGridModel;
	courseDisplayModels: TimetableCourseDisplayModel[];
	placements: PlacedItem[];
	weekRangeText: string;
	isCurrentWeek: boolean;
	academicWeek: number;
}

/**
 * Computes complete timetable week layout in a single pure pipeline.
 * Evaluates grid geometry, visible courses, overlap placements and week ranges.
 */
export function computeTimetableWeekLayout(
	input: TimetableWeekLayoutInput
): TimetableWeekLayoutResult {
	const {
		timetable,
		displayedWeek,
		todayIso,
		columnWidthPx = 0,
		expandedSlotKeys = new Set<string>(),
		layoutMode = 'fixed',
		capsuleCornerStyle = 'rounded',
		coursePalette = COURSE_PALETTE_ENTRIES,
		paletteCourses,
		academicCalendarService = new AcademicCalendarService()
	} = input;

	const academicWeek = academicCalendarService.calculateAcademicWeek(
		todayIso,
		timetable.academicConfig
	);
	const isCurrentWeek = displayedWeek === academicWeek;

	const gridModel = calculateTimetableGrid(todayIso, displayedWeek, timetable, {
		academicCalendarService
	});

	const visibleDaySet = new Set(gridModel.visibleDays.map((day) => day.dayOfWeek));
	const holidayMutedDayOfWeeks = new Set(
		gridModel.visibleDays.filter((day) => day.holiday).map((day) => day.dayOfWeek)
	);
	const courseDisplayModels = buildTimetableCourseDisplayModels(
		timetable,
		visibleDaySet,
		displayedWeek,
		holidayMutedDayOfWeeks
	);

	const placements = placeCapsules({
		courseDisplayModels,
		visibleDays: gridModel.visibleDays,
		columnWidthPx,
		expandedSlotKeys,
		layoutMode,
		capsuleCornerStyle,
		coursePalette,
		paletteCourses
	});

	const weekRangeText = formatWeekDateRange(
		timetable.academicConfig,
		displayedWeek,
		todayIso,
		timetable.viewPrefs,
		academicCalendarService
	);

	return {
		gridModel,
		courseDisplayModels,
		placements,
		weekRangeText,
		isCurrentWeek,
		academicWeek
	};
}
