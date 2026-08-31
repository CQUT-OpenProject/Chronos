import type { Course } from '../domain/course';
import type { AcademicConfig, Timetable } from '../domain/timetable';
import type { UserPreferences } from '../domain/preferences';
import type { Disposable, ServiceIdentifier } from './services';
import type {
	ChronosSlotMap,
	LocalizedText,
	CourseBadge,
	ImportTabSlotContribution
} from './slots';
import type { ConfigSchema } from '../schema/schema';

/** Plugin category classification */
export type PluginCategory = 'source' | 'parser' | 'codec' | 'theme' | 'tool';

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
	/** Allowed domain whitelist for network requests */
	readonly allowedDomains?: string[];

	/** Plugin activation lifecycle hook */
	apply(ctx: ChronosContext<Config>): void | Promise<void>;
	/** Plugin deactivation cleanup hook */
	dispose?(): void | Promise<void>;
}

export interface ChronosContext<Config extends object = Record<string, unknown>> {
	readonly pluginId: string;

	/** Access an injected capability service (Capability Seam) */
	service<T>(identifier: ServiceIdentifier<T>): T;

	/** Access an optional injected capability service */
	tryService<T>(identifier: ServiceIdentifier<T>): T | undefined;

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
		registerMessages(messages: Record<string, Record<string, string>>): Disposable;
	};

	/** Read-only core state snapshot */
	readonly state: {
		readonly currentTimetable: Readonly<Timetable> | null;
		readonly activeWeek: number;
		readonly currentPeriodIndex: number | null;
		readonly activeThemeId: string;
		readonly activeIconThemeId: string;
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
		revertToDefaultThemes(): Promise<void>;
		notify(message: string, type?: 'info' | 'warn' | 'error'): void;
	};

	/** Declarative hierarchical slot registration (auto-tracked and revoked on unload) */
	registerSlot<K extends Exclude<keyof ChronosSlotMap, 'import.source.tab'>>(
		slotName: K,
		contribution: ChronosSlotMap[K] & { id: string }
	): Disposable;
	registerSlot<FormState extends object>(
		slotName: 'import.source.tab',
		contribution: ImportTabSlotContribution<FormState> & { id: string }
	): Disposable;

	/** Event bus listener (auto-tracked and revoked on unload) */
	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable;

	/** Emit an event on the shared engine bus */
	emit<E extends keyof ChronosEvents>(event: E, payload: ChronosEvents[E]): void;

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
	'preferences:updated': { preferences: UserPreferences };
	'time:tick': {
		currentWeek: number;
		currentPeriod: number | null;
		now: Date;
		todayIso: string;
	};
	'theme:changed': { themeId: string };
	'iconTheme:changed': { iconThemeId: string };
	'i18n:localeChanged': { locale: string };
	'config:changed': { pluginId: string; config: Record<string, unknown> };
	'slots:updated': void;
	'badges:updated': { badges: Record<string, CourseBadge[]> };
	'plugin:loaded': { pluginId: string };
	'plugin:unloaded': { pluginId: string };
	'dynamicColor:set': { blob: Blob | null };
	'dynamicColor:changed': { uri: string | null };
	'dynamicColor:hydrate': void;
}
