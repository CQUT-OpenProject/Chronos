import type { Course } from '../domain/course';
import type { AcademicConfig, Timetable } from '../domain/timetable';
import type { UserPreferences } from '../domain/preferences';
import type { ChronosEnv, Disposable } from './env';
import type {
	CourseActionContribution,
	CourseBadge,
	CourseBadgeContribution,
	ExportResult,
	ThemeContribution,
	TimetableExporterAdapter,
	TimetableSourceAdapter
} from './contributions';

export type LocalizedText = string | (() => string);

export interface ChronosPlugin {
	readonly id: string;
	readonly name: LocalizedText;
	readonly version: string;
	readonly description?: LocalizedText;
	/** Plugin activation lifecycle hook */
	apply(ctx: ChronosContext): void | Promise<void>;
	/** Plugin deactivation cleanup hook */
	dispose?(): void | Promise<void>;
}

export interface ExportTransformContext {
	readonly exporterId: string;
	timetable: Timetable;
	targetData: Record<string, unknown>;
}

export type ExportTransformHook = (ctx: ExportTransformContext) => void | Promise<void>;

export interface ChronosContext {
	/** Host-provided environment capabilities (restricted view) */
	readonly env: Readonly<ChronosEnv>;

	/** Plugin-private persistent storage (automatically namespaced by plugin ID) */
	readonly storage: {
		get<T = unknown>(key: string): Promise<T | null>;
		set<T = unknown>(key: string, value: T): Promise<void>;
		delete(key: string): Promise<void>;
	};

	/** Internationalization runtime */
	readonly i18n: {
		readonly locale: string;
		t(key: string, params?: Record<string, unknown>): string;
	};

	/** Read-only state snapshot */
	readonly state: {
		readonly currentTimetable: Readonly<Timetable> | null;
		readonly activeWeek: number;
		readonly currentPeriodIndex: number | null;
		readonly activeThemeId: string;
		readonly userPreferences: Readonly<UserPreferences>;
	};

	/** Domain dispatch actions */
	readonly actions: {
		// Timetable lifecycle
		createTimetable(name: string, config?: Partial<AcademicConfig>): Promise<Timetable>;
		switchTimetable(timetableId: string): Promise<void>;
		deleteTimetable(timetableId: string): Promise<void>;
		saveCurrentTimetableDetails(patch: Partial<Timetable>): Promise<void>;

		// Course operations
		saveCourse(course: Course): Promise<void>;
		updateCourse(courseId: string, patch: Partial<Course>): Promise<void>;
		deleteCourse(courseId: string): Promise<void>;

		// Global preferences & theme switching
		setTheme(themeId: string): void;
		updatePreferences(patch: Partial<UserPreferences>): Promise<void>;

		// UI notifications
		notify(message: string, type?: 'info' | 'warn' | 'error'): void;
	};

	/** Scoped disposable registry (unregistered in batch upon plugin disposal) */
	readonly subscriptions: Disposable[];

	/** Event bus listener (automatically added to subscriptions) */
	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable;

	/** Waterfall transformation pipeline interceptor */
	registerExportTransform(hook: ExportTransformHook): Disposable;

	/** Declarative extension point registrations */
	registerSource(adapter: TimetableSourceAdapter): Disposable;
	registerExporter(adapter: TimetableExporterAdapter): Disposable;
	registerCourseAction(action: CourseActionContribution): Disposable;
	registerCourseBadge(badge: CourseBadgeContribution): Disposable;
	registerTheme(theme: ThemeContribution): Disposable;
}

export interface ChronosEvents {
	'timetable:loaded': { timetable: Timetable };
	'timetable:switched': { previousId: string | null; currentId: string; timetable: Timetable };
	'timetable:updated': { timetable: Timetable };
	'preferences:updated': { preferences: UserPreferences };
	'time:tick': { currentWeek: number; currentPeriod: number | null };
	'theme:changed': { themeId: string };
	'import:before': { sourceId: string };
	'import:after': { sourceId: string; timetable: Timetable };
	'export:before': { exporterId: string; timetable: Timetable };
	'export:after': { exporterId: string; result: ExportResult };
	'plugin:loaded': { pluginId: string };
	'plugin:unloaded': { pluginId: string };
	'slots:updated': void;
	'badges:updated': { badges: Record<string, CourseBadge[]> };
}
