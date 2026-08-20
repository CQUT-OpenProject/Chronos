import type { Course } from '../domain/course';
import type { AcademicConfig, Timetable } from '../domain/timetable';
import type { UserPreferences } from '../domain/preferences';
import type { Disposable, ServiceIdentifier } from './services';
import type { ChronosSlotMap, LocalizedText, CourseBadge, ExportResult } from './slots';
import type { ConfigSchema } from '../schema/schema';

export type { LocalizedText } from './slots';

/** Plugin category classification */
export type PluginCategory = 'source' | 'parser' | 'codec' | 'theme' | 'tool';

/**
 * Custom event map extension point for module augmentation.
 * Plugins can extend this interface via `declare module '@chronos/core'`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomChronosEvents {}

export interface ChronosPlugin<Config extends object = Record<string, unknown>> {
	readonly id: string;
	readonly name: LocalizedText;
	readonly version: string;
	/** Concise one-sentence description (<= 60 chars) */
	readonly description?: LocalizedText;
	/** Domain category of the plugin */
	readonly category?: PluginCategory;
	/** Display and initialization priority (built-in sources: 10-90, user extensions: 100+) */
	readonly order?: number;
	/** Author or maintainer information */
	readonly author?: string;
	/** Homepage or repository URL */
	readonly homepage?: string;
	/** Rich documentation or usage guide (supports Markdown & multi-lingual text) */
	readonly readme?: LocalizedText;
	readonly configSchema?: ConfigSchema<Config>;
	readonly defaultConfig?: Config;
	/** Declared service dependencies (plugin remains pending until all dependencies are satisfied) */
	readonly inject?: ReadonlyArray<ServiceIdentifier<unknown> | string>;
	/** Declared permissions required by the plugin (for sandbox permission gate, e.g. ['network', 'storage']) */
	readonly permissions?: Array<'network' | 'storage' | 'vault' | 'notifications'>;
	/** Allowed domain whitelist for network requests */
	readonly allowedDomains?: string[];

	/** Plugin activation lifecycle hook */
	apply(ctx: ChronosContext<Config>): void | Promise<void>;
	/** Plugin deactivation cleanup hook */
	dispose?(): void | Promise<void>;
}

export interface ExportTransformContext {
	readonly exporterId: string;
	timetable: Timetable;
	targetData: Record<string, unknown>;
}

export type ExportTransformHook = (ctx: ExportTransformContext) => void | Promise<void>;

export interface ChronosContext<Config extends object = Record<string, unknown>> {
	readonly pluginId: string;

	/** Access an injected capability service (Capability Seam) */
	service<T>(identifier: ServiceIdentifier<T>): T;

	/** Type-safe private plugin configuration (synchronized with persistent storage) */
	readonly config: Readonly<Config>;
	updateConfig(patch: Partial<Config>): Promise<void>;

	/** Plugin-private isolated storage (namespaced automatically by pluginId) */
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

	/** Read-only core state snapshot */
	readonly state: {
		readonly currentTimetable: Readonly<Timetable> | null;
		readonly activeWeek: number;
		readonly currentPeriodIndex: number | null;
		readonly activeThemeId: string;
		readonly userPreferences: Readonly<UserPreferences>;
	};

	/** Domain action dispatcher */
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
		notify(message: string, type?: 'info' | 'warn' | 'error'): void;
	};

	/** Declarative hierarchical slot registration (auto-tracked and revoked on unload) */
	registerSlot<K extends keyof ChronosSlotMap>(
		slotName: K,
		contribution: ChronosSlotMap[K] & { id: string }
	): Disposable;

	/** Event bus listener (auto-tracked and revoked on unload) */
	on<E extends keyof (ChronosEvents & CustomChronosEvents)>(
		event: E,
		handler: (payload: (ChronosEvents & CustomChronosEvents)[E]) => void | Promise<void>
	): Disposable;

	/** Data pipeline transformation interceptor */
	registerPipelineHook(hook: (context: unknown) => void | Promise<void>): Disposable;

	/** Waterfall onion middleware hook */
	registerWaterfallHook<T = unknown, R = unknown>(
		event: string,
		handler: (payload: T, next: () => Promise<R> | R) => Promise<R> | R
	): Disposable;

	/** Serial decision / guard hook (return false to short-circuit) */
	registerSerialHook<T = unknown>(
		event: string,
		handler: (payload: T) => Promise<boolean | void> | boolean | void
	): Disposable;

	/**
	 * Conditionally activate logic when all specified optional services
	 * become available. The callback is invoked once dependencies are met
	 * and automatically disposed when any dependency is unregistered.
	 */
	inject(
		deps: ReadonlyArray<ServiceIdentifier<unknown> | string>,
		callback: (ctx: ChronosContext<Config>) => Disposable | void
	): Disposable;

	/** Manually register disposable resources to be cleaned up on unload */
	addDisposable(disposable: Disposable): void;
}

export interface ChronosEvents {
	'timetable:loaded': { timetable: Timetable };
	'timetable:switched': { previousId: string | null; currentId: string; timetable: Timetable };
	'timetable:updated': { timetable: Timetable };
	'timetables:updated': {
		timetables: Array<{ id: string; name: string; courseCount?: number; updatedAt: number }>;
	};
	'wallpaper:updated': { wallpaperUri: string | null };
	'preferences:updated': { preferences: UserPreferences };
	'time:tick': { currentWeek: number; currentPeriod: number | null };
	'theme:changed': { themeId: string };
	'i18n:localeChanged': { locale: string };
	'config:changed': { pluginId: string; config: Record<string, unknown> };
	'slots:updated': void;
	'badges:updated': { badges: Record<string, CourseBadge[]> };
	'import:before': { sourceId: string };
	'import:after': { sourceId: string; timetable: Timetable };
	'export:before': { exporterId: string; timetable: Timetable };
	'export:after': { exporterId: string; result: ExportResult };
	'plugin:loaded': { pluginId: string };
	'plugin:unloaded': { pluginId: string };
}
