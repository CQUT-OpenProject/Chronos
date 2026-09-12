import type {
	AcademicConfig,
	ChronosContext,
	ChronosEngine,
	Course,
	CourseBadge,
	Disposable,
	StandardSlotMap,
	Timetable,
	UserPreferences
} from '@chronos/core';
import type { Readable } from 'svelte/store';

export type ChronosUiSnapshot = {
	currentTimetable: Timetable | null;
	timetables: Array<{ id: string; name: string; courseCount?: number; updatedAt: number }>;
	activeWeek: number;
	currentPeriodIndex: number | null;
	activeThemeId: string;
	activeIconThemeId: string;
	userPreferences: UserPreferences | null;
	currentLocale: string;
	clockNow: Date;
	clockTodayIso: string;
	slotVersion: number;
	courseBadges: Record<string, CourseBadge[]>;
};

export interface ChronosUiController extends Disposable {
	readonly snapshot: Readable<ChronosUiSnapshot>;
	getPluginContext(pluginId: string): ChronosContext;
	getPluginContextForSlot<K extends keyof StandardSlotMap>(
		slotName: K,
		slotId: string
	): ChronosContext;
	getSlots<K extends keyof StandardSlotMap>(slotName: K): Array<StandardSlotMap[K]>;
	getSlotItem<K extends keyof StandardSlotMap>(
		slotName: K,
		id: string
	): StandardSlotMap[K] | undefined;
	resolveSlotOwner<K extends keyof StandardSlotMap>(
		slotName: K,
		slotId: string
	): string | undefined;
	createTimetable(name: string, config?: Partial<AcademicConfig>): Promise<Timetable>;
	switchTimetable(timetableId: string): Promise<void>;
	deleteTimetable(timetableId: string): Promise<void>;
	saveCurrentTimetableDetails(patch: Partial<Timetable>): Promise<void>;
	saveCourse(course: Course): Promise<void>;
	updateCourse(courseId: string, patch: Partial<Course>): Promise<void>;
	deleteCourse(courseId: string): Promise<void>;
	setTheme(themeId: string): void;
	updatePreferences(patch: Partial<UserPreferences>): Promise<void>;
	clearAllData(): Promise<void>;
	notify(message: string, type?: 'info' | 'warn' | 'error'): void;
	translatePlugin(pluginId: string, key: string, params?: Record<string, unknown>): string;
}

export type ChronosUiControllerEngine = ChronosEngine;
