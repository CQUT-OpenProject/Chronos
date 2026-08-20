import type { Course } from '../domain/course';
import type { AcademicConfig, Timetable } from '../domain/timetable';
import type { UserPreferences } from '../domain/preferences';
import type { ChronosEnv } from '../types/env';
import type { Disposable, ServiceIdentifier } from '../types/services';
import { IStorageService } from '../types/services';
import type { ChronosContext, ChronosEvents, CustomChronosEvents } from '../types/context';
import type { ChronosSlotMap } from '../types/slots';
import type { EventPipeline } from './event-pipeline';
import type { HierarchicalSlotRegistry } from './hierarchical-slot-registry';
import type { ServiceContainer } from './service-container';
import type { ThemeRegistry } from './theme-registry';
import type { BadgeManager } from './badge-manager';

export interface EngineContextHost {
	readonly services: ServiceContainer;
	readonly events: EventPipeline;
	readonly pipeline: EventPipeline;
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
		this.host.events.emit('config:changed', {
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

	registerSlot<K extends keyof ChronosSlotMap>(
		slotName: K,
		contribution: ChronosSlotMap[K] & { id: string }
	): Disposable {
		return this.track(this.host.slots.register(slotName, contribution));
	}

	on<E extends keyof (ChronosEvents & CustomChronosEvents)>(
		event: E,
		handler: (payload: (ChronosEvents & CustomChronosEvents)[E]) => void | Promise<void>
	): Disposable {
		return this.track(this.host.events.on(event, handler));
	}

	registerPipelineHook(hook: (context: unknown) => void | Promise<void>): Disposable {
		return this.track(
			this.host.pipeline.registerWaterfall('pipeline:exportTransform', async (ctx, next) => {
				await hook(ctx);
				return next();
			})
		);
	}

	registerWaterfallHook<T = unknown, R = unknown>(
		event: string,
		handler: (payload: T, next: () => Promise<R> | R) => Promise<R> | R
	): Disposable {
		return this.track(this.host.pipeline.registerWaterfall(event, handler));
	}

	registerSerialHook<T = unknown>(
		event: string,
		handler: (payload: T) => Promise<boolean | void> | boolean | void
	): Disposable {
		return this.track(this.host.pipeline.registerSerial(event, handler));
	}

	inject(
		deps: ReadonlyArray<ServiceIdentifier<unknown> | string>,
		callback: (ctx: ChronosContext<Config>) => Disposable | void
	): Disposable {
		const keys = deps.map((d) => (typeof d === 'string' ? d : d.key));
		let callbackDisposable: Disposable | void;
		let activated = false;

		const tryActivate = () => {
			if (activated) return;
			if (keys.every((k) => this.host.services.hasKey(k))) {
				activated = true;
				callbackDisposable = callback(this);
			}
		};

		const deactivate = () => {
			if (!activated) return;
			activated = false;
			callbackDisposable?.dispose();
			callbackDisposable = undefined;
		};

		const regSub = this.host.services.onServiceRegistered((key) => {
			if (keys.includes(key)) tryActivate();
		});

		const unregSub = this.host.services.onServiceUnregistered((key) => {
			if (keys.includes(key)) deactivate();
		});

		// Check if all deps are already satisfied at registration time
		tryActivate();

		const handle: Disposable = {
			dispose: () => {
				deactivate();
				regSub.dispose();
				unregSub.dispose();
			}
		};

		this.subscriptions.push(handle);
		return handle;
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
