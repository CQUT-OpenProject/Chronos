import type { Course } from '../domain/course';
import type { AcademicConfig, Timetable } from '../domain/timetable';
import type { UserPreferences } from '../domain/preferences';
import type { ChronosEnv } from '../types/env';
import type { ServiceContainer } from './service-container';
import type { EventPipeline } from './event-pipeline';
import type { HierarchicalSlotRegistry } from './hierarchical-slot-registry';
import type { ThemeRegistry } from './theme-registry';
import type { IconThemeRegistry } from './icon-theme-registry';
import type { BadgeManager } from './badge-manager';
import type { I18nCatalog } from '../i18n/i18n-catalog';

/** Host surface exposed to plugin ScopedContext instances. */
export interface EngineContextHost {
	readonly services: ServiceContainer;
	readonly events: EventPipeline;
	readonly slots: HierarchicalSlotRegistry;
	readonly themes?: ThemeRegistry;
	readonly iconThemes?: IconThemeRegistry;
	readonly badges?: BadgeManager;
	readonly env: ChronosEnv;
	readonly i18nCatalog: I18nCatalog;
	readonly locale: string;
	translateForPlugin(pluginId: string, key: string, params?: Record<string, unknown>): string;
	readonly state: {
		readonly currentTimetable: Readonly<Timetable> | null;
		readonly activeWeek: number;
		readonly currentPeriodIndex: number | null;
		readonly activeThemeId: string;
		readonly activeIconThemeId: string;
		readonly userPreferences: Readonly<UserPreferences>;
	};
	readonly actions: {
		createTimetable(name: string, config?: Partial<AcademicConfig>): Promise<Timetable>;
		importTimetable(
			timetable: Timetable,
			options?: { overwriteActive?: boolean }
		): Promise<Timetable>;
		switchTimetable(timetableId: string): Promise<void>;
		deleteTimetable(timetableId: string): Promise<void>;
		saveCurrentTimetableDetails(patch: Partial<Timetable>): Promise<void>;
		saveCourse(course: Course): Promise<void>;
		updateCourse(courseId: string, patch: Partial<Course>): Promise<void>;
		deleteCourse(courseId: string): Promise<void>;
		setTheme(themeId: string): void;
		updatePreferences(patch: Partial<UserPreferences>): Promise<void>;
		revertToDefaultThemes(): Promise<void>;
		notify(message: string, type?: 'info' | 'warn' | 'error'): void;
	};
}
