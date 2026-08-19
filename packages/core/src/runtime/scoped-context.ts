import type { Course } from '../domain/course';
import type { AcademicConfig, Timetable } from '../domain/timetable';
import type { UserPreferences } from '../domain/preferences';
import type { ChronosEnv } from '../types/env';
import type { Disposable, ServiceIdentifier } from '../types/services';
import { IStorageService } from '../types/services';
import type { ChronosContext, ChronosEvents, ExportTransformHook } from '../types/context';
import type { StandardSlotMap, ThemeSlotContribution } from '../types/slots';
import type {
	CourseActionContribution,
	CourseBadgeContribution,
	ThemeContribution,
	TimetableExporterAdapter,
	TimetableSourceAdapter
} from '../types/contributions';
import type { EventBus } from './event-bus';
import type { Pipeline } from './pipeline';
import type { HierarchicalSlotRegistry } from './hierarchical-slot-registry';
import type { ServiceContainer } from './service-container';
import type { ThemeRegistry } from './theme-registry';
import type { BadgeManager } from './badge-manager';

export interface EngineContextHost {
	readonly services: ServiceContainer;
	readonly events: EventBus;
	readonly pipeline: Pipeline;
	readonly slots: HierarchicalSlotRegistry;
	readonly themes?: ThemeRegistry;
	readonly badges?: BadgeManager;
	readonly env: ChronosEnv;
	readonly locale: string;
	t(key: string, params?: Record<string, unknown>): string;
	readonly state: {
		readonly currentTimetable: Readonly<Timetable> | null;
		readonly activeWeek: number;
		readonly currentPeriodIndex: number | null;
		readonly activeThemeId: string;
		readonly userPreferences: Readonly<UserPreferences>;
	};
	readonly actions: {
		createTimetable(name: string, config?: Partial<AcademicConfig>): Promise<Timetable>;
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
}

export class ScopedContext<Config extends object = Record<string, unknown>>
	implements ChronosContext<Config>, Disposable
{
	readonly subscriptions: Disposable[] = [];
	private _config: Config;

	readonly storage: {
		get<T = unknown>(key: string): Promise<T | null>;
		set<T = unknown>(key: string, value: T): Promise<void>;
		delete(key: string): Promise<void>;
	};

	readonly i18n: {
		readonly locale: string;
		t(key: string, params?: Record<string, unknown>): string;
	};

	constructor(
		readonly pluginId: string,
		private host: EngineContextHost,
		initialConfig?: Config
	) {
		this._config = (initialConfig ?? {}) as Config;

		this.storage = {
			get: <T = unknown>(key: string) => {
				if (this.host.services.has(IStorageService)) {
					return this.host.services.get(IStorageService).getPluginData<T>(this.pluginId, key);
				}
				if (this.host.env?.storage) {
					return this.host.env.storage.getPluginData<T>(this.pluginId, key);
				}
				return Promise.resolve(null);
			},
			set: <T = unknown>(key: string, value: T) => {
				if (this.host.services.has(IStorageService)) {
					return this.host.services
						.get(IStorageService)
						.setPluginData<T>(this.pluginId, key, value);
				}
				if (this.host.env?.storage) {
					return this.host.env.storage.setPluginData<T>(this.pluginId, key, value);
				}
				return Promise.resolve();
			},
			delete: (key: string) => {
				if (this.host.services.has(IStorageService)) {
					return this.host.services.get(IStorageService).deletePluginData(this.pluginId, key);
				}
				if (this.host.env?.storage) {
					return this.host.env.storage.deletePluginData(this.pluginId, key);
				}
				return Promise.resolve();
			}
		};

		this.i18n = {
			get locale() {
				return host.locale;
			},
			t: (key: string, params?: Record<string, unknown>) => host.t(key, params)
		};
	}

	get env(): Readonly<ChronosEnv> {
		return this.host.env;
	}

	get config(): Readonly<Config> {
		return this._config;
	}

	async updateConfig(patch: Partial<Config>): Promise<void> {
		this._config = {
			...this._config,
			...patch
		};
		await this.storage.set('__config__', this._config);
		void this.host.events.emit('config:changed', {
			pluginId: this.pluginId,
			config: this._config as Record<string, unknown>
		});
	}

	service<T>(identifier: ServiceIdentifier<T>): T {
		return this.host.services.get(identifier);
	}

	get state() {
		return this.host.state;
	}

	get actions() {
		return this.host.actions;
	}

	private track<T extends Disposable>(disposable: T): T {
		this.subscriptions.push(disposable);
		return {
			dispose: () => {
				const index = this.subscriptions.indexOf(disposable);
				if (index >= 0) {
					this.subscriptions.splice(index, 1);
				}
				disposable.dispose();
			}
		} as T;
	}

	addDisposable(disposable: Disposable): void {
		this.subscriptions.push(disposable);
	}

	registerSlot<K extends keyof StandardSlotMap>(
		slotName: K,
		contribution: StandardSlotMap[K] & { id: string }
	): Disposable {
		return this.track(this.host.slots.register(slotName, contribution));
	}

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		return this.track(this.host.events.on(event, handler));
	}

	registerPipelineHook(hook: (context: unknown) => void | Promise<void>): Disposable {
		return this.track(this.host.pipeline.registerExportTransform(hook as ExportTransformHook));
	}

	// === Backward Compatibility Transition Adapters ===
	registerExportTransform(hook: ExportTransformHook): Disposable {
		return this.track(this.host.pipeline.registerExportTransform(hook));
	}

	registerSource(adapter: TimetableSourceAdapter): Disposable {
		return this.track(this.host.slots.registerSource(adapter));
	}

	registerExporter(adapter: TimetableExporterAdapter): Disposable {
		return this.track(this.host.slots.registerExporter(adapter));
	}

	registerCourseAction(action: CourseActionContribution): Disposable {
		return this.track(this.host.slots.registerCourseAction(action));
	}

	registerCourseBadge(badge: CourseBadgeContribution): Disposable {
		if (this.host.badges) {
			return this.track(this.host.badges.registerCourseBadge(badge));
		}
		return this.track(
			this.host.slots.register('timetable.cell.badge', {
				id: badge.id,
				getBadge: (course) => (badge.getBadge ? badge.getBadge(course) : null)
			})
		);
	}

	registerTheme(theme: ThemeContribution | ThemeSlotContribution): Disposable {
		if (this.host.themes && 'supportsDynamicColor' in theme) {
			return this.track(this.host.themes.registerTheme(theme as ThemeContribution));
		}
		return this.track(
			this.host.slots.register('theme.definition', theme as ThemeSlotContribution & { id: string })
		);
	}

	dispose(): void {
		// Revoke all registrations and effects in reverse order (LIFO)
		for (let i = this.subscriptions.length - 1; i >= 0; i--) {
			const sub = this.subscriptions[i];
			if (sub) {
				try {
					sub.dispose();
				} catch (error) {
					console.error(
						`[ScopedContext] Error disposing subscription in "${this.pluginId}":`,
						error
					);
				}
			}
		}
		this.subscriptions.length = 0;
	}
}
