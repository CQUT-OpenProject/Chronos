import type { Course } from '../domain/course';
import { type AcademicConfig, type Timetable, createTimetable } from '../domain/timetable';
import { type UserPreferences, DEFAULT_USER_PREFERENCES } from '../domain/preferences';
import type { ChronosEnv, StorageChangeEvent } from '../types/env';
import type { Disposable } from '../types/services';
import { IHttpService, IStorageService, IVaultService, IRuntimeService } from '../types/services';
import type { ChronosEvents, ChronosPlugin } from '../types/context';
import { EventBus } from './event-bus';
import { Pipeline } from './pipeline';
import { HierarchicalSlotRegistry } from './hierarchical-slot-registry';
import { ServiceContainer } from './service-container';
import { ThemeRegistry } from './theme-registry';
import { BadgeManager } from './badge-manager';
import { ScopedContext, type EngineContextHost } from './scoped-context';
import { AcademicCalendarService } from '../engine/calendar';
import { formatIsoDate } from '../engine/date';

export interface ChronosEngineOptions {
	env?: ChronosEnv;
	services?: ServiceContainer;
	initialLocale?: string;
	i18nHandler?: (key: string, params?: Record<string, unknown>) => string;
	onNotification?: (message: string, type: 'info' | 'warn' | 'error') => void;
}

export class ChronosEngine implements EngineContextHost, Disposable {
	readonly env: ChronosEnv;
	readonly services: ServiceContainer;
	readonly events: EventBus;
	readonly pipeline: Pipeline;
	readonly slots: HierarchicalSlotRegistry;
	readonly themes: ThemeRegistry;
	readonly badges: BadgeManager;

	private _locale: string;
	private _i18nHandler?: (key: string, params?: Record<string, unknown>) => string;
	private _onNotification?: (message: string, type: 'info' | 'warn' | 'error') => void;

	private _currentTimetable: Timetable | null = null;
	private _activeWeek = 1;
	private _currentPeriodIndex: number | null = null;
	private _activeThemeId = 'm3-default';
	private _userPreferences: UserPreferences = { ...DEFAULT_USER_PREFERENCES };

	private loadedPlugins = new Map<
		string,
		{
			plugin: ChronosPlugin<Record<string, unknown>>;
			context: ScopedContext<Record<string, unknown>>;
		}
	>();
	private storageSubscription?: Disposable;
	private calendarService = new AcademicCalendarService();

	constructor(options: ChronosEngineOptions) {
		this.services = options.services ?? new ServiceContainer();
		this._locale = options.initialLocale ?? 'zh-cn';
		this._i18nHandler = options.i18nHandler;
		this._onNotification = options.onNotification;

		this.events = new EventBus();
		this.pipeline = new Pipeline();
		this.slots = new HierarchicalSlotRegistry(() => {
			void this.events.emit('slots:updated', undefined);
		});
		this.themes = new ThemeRegistry();
		this.badges = new BadgeManager((badges) => {
			void this.events.emit('badges:updated', { badges });
		});

		// If env is provided, register standard service providers into ServiceContainer
		if (options.env) {
			this.env = options.env;
			this.registerEnvProviders(this.env);
		} else {
			this.env = this.createEnvFacade(this.services);
		}
	}

	private registerEnvProviders(env: ChronosEnv): void {
		if (!this.services.has(IStorageService) && env.storage) {
			this.services.register(IStorageService, env.storage);
		}
		if (!this.services.has(IHttpService) && env.http) {
			this.services.register(IHttpService, env.http);
		}
		if (!this.services.has(IVaultService) && env.vault) {
			this.services.register(IVaultService, env.vault);
		}
		if (!this.services.has(IRuntimeService) && env.runtime) {
			this.services.register(IRuntimeService, {
				platform: env.platform,
				setTimeout: env.runtime.setTimeout.bind(env.runtime),
				clearTimeout: env.runtime.clearTimeout.bind(env.runtime),
				sha256: env.runtime.sha256.bind(env.runtime),
				encodeUtf8: env.runtime.encodeUtf8.bind(env.runtime),
				decodeUtf8: env.runtime.decodeUtf8.bind(env.runtime)
			});
		}
	}

	private createEnvFacade(services: ServiceContainer): ChronosEnv {
		return {
			platform: services.tryGet(IRuntimeService)?.platform ?? 'web',
			http: {
				request: (url, opts) => {
					const svc = services.tryGet(IHttpService);
					if (!svc) throw new Error('[ChronosEngine] IHttpService is not registered');
					return svc.request(url, opts);
				},
				clearSession: (sid) =>
					services.tryGet(IHttpService)?.clearSession?.(sid) ?? Promise.resolve()
			},
			storage: {
				getTimetable: (id) => services.get(IStorageService).getTimetable(id),
				listTimetables: () => services.get(IStorageService).listTimetables(),
				saveTimetable: (tt) => services.get(IStorageService).saveTimetable(tt),
				patchTimetable: (id, patch) => services.get(IStorageService).patchTimetable(id, patch),
				deleteTimetable: (id) => services.get(IStorageService).deleteTimetable(id),
				getActiveTimetableId: () => services.get(IStorageService).getActiveTimetableId(),
				setActiveTimetableId: (id) => services.get(IStorageService).setActiveTimetableId(id),
				getPreferences: () => services.get(IStorageService).getPreferences(),
				savePreferences: (patch) => services.get(IStorageService).savePreferences(patch),
				getWallpaper: () => services.get(IStorageService).getWallpaper?.() ?? Promise.resolve(null),
				setWallpaper: (wp) => services.get(IStorageService).setWallpaper?.(wp) ?? Promise.resolve(),
				getPluginData: (pid, k) => services.get(IStorageService).getPluginData(pid, k),
				setPluginData: (pid, k, v) => services.get(IStorageService).setPluginData(pid, k, v),
				deletePluginData: (pid, k) => services.get(IStorageService).deletePluginData(pid, k),
				onChanged: (l) => services.get(IStorageService).onChanged?.(l) ?? { dispose: () => {} }
			},
			vault: {
				isSupported: () => services.tryGet(IVaultService)?.isSupported() ?? Promise.resolve(false),
				storeSecret: (k, s, opts) => {
					const svc = services.tryGet(IVaultService);
					if (!svc) throw new Error('[ChronosEngine] IVaultService is not registered');
					return svc.storeSecret(k, s, opts);
				},
				getSecret: (k) => services.tryGet(IVaultService)?.getSecret(k) ?? Promise.resolve(null),
				removeSecret: (k) => services.tryGet(IVaultService)?.removeSecret(k) ?? Promise.resolve()
			},
			runtime: {
				setTimeout: (fn, ms) =>
					services.tryGet(IRuntimeService)?.setTimeout(fn, ms) ??
					(setTimeout(fn, ms) as unknown as number),
				clearTimeout: (h) => {
					const svc = services.tryGet(IRuntimeService);
					if (svc) svc.clearTimeout(h);
					else clearTimeout(h);
				},
				sha256: (d) => {
					const svc = services.tryGet(IRuntimeService);
					if (!svc) throw new Error('[ChronosEngine] IRuntimeService is not registered');
					return svc.sha256(d);
				},
				encodeUtf8: (s) =>
					services.tryGet(IRuntimeService)?.encodeUtf8(s) ?? new TextEncoder().encode(s),
				decodeUtf8: (b) =>
					services.tryGet(IRuntimeService)?.decodeUtf8(b) ?? new TextDecoder().decode(b)
			}
		};
	}

	get storage(): import('../types/services').IStorageService {
		return this.services.get(IStorageService);
	}

	get locale(): string {
		return this._locale;
	}

	setLocale(locale: string): void {
		this._locale = locale;
		void this.events.emit('i18n:localeChanged', { locale });
	}

	t(key: string, params?: Record<string, unknown>): string {
		if (this._i18nHandler) {
			return this._i18nHandler(key, params);
		}
		if (params && typeof params.default === 'string') {
			return params.default;
		}
		return key;
	}

	get state() {
		return {
			currentTimetable: this._currentTimetable,
			activeWeek: this._activeWeek,
			currentPeriodIndex: this._currentPeriodIndex,
			activeThemeId: this._activeThemeId,
			userPreferences: this._userPreferences
		};
	}

	get actions() {
		return {
			createTimetable: this.createTimetable.bind(this),
			switchTimetable: this.switchTimetable.bind(this),
			deleteTimetable: this.deleteTimetable.bind(this),
			saveCurrentTimetableDetails: this.saveCurrentTimetableDetails.bind(this),
			saveCourse: this.saveCourse.bind(this),
			updateCourse: this.updateCourse.bind(this),
			deleteCourse: this.deleteCourse.bind(this),
			setTheme: this.setTheme.bind(this),
			updatePreferences: this.updatePreferences.bind(this),
			notify: this.notify.bind(this)
		};
	}

	async init(): Promise<void> {
		const storage = this.storage;
		this._userPreferences = await storage.getPreferences();

		let activeId = await storage.getActiveTimetableId();
		if (!activeId) {
			const list = await storage.listTimetables();
			if (list.length > 0) {
				activeId = list[0]!.id;
				await storage.setActiveTimetableId(activeId);
			}
		}

		if (activeId) {
			this._currentTimetable = await storage.getTimetable(activeId);
		}

		this.updateTime();

		if (this._currentTimetable) {
			await this.badges.recalculate(this._currentTimetable.courses);
			await this.events.emit('timetable:loaded', { timetable: this._currentTimetable });
		}

		if (storage.onChanged) {
			this.storageSubscription = storage.onChanged(this.handleStorageChange.bind(this));
		}
	}

	private async handleStorageChange(event: StorageChangeEvent): Promise<void> {
		const storage = this.storage;
		if (event.type === 'preferences') {
			this._userPreferences = await storage.getPreferences();
			await this.events.emit('preferences:updated', { preferences: this._userPreferences });
		} else if (event.type === 'timetable') {
			const activeId = await storage.getActiveTimetableId();
			if (activeId) {
				const updated = await storage.getTimetable(activeId);
				if (updated) {
					this._currentTimetable = updated;
					this.updateTime();
					await this.badges.recalculate(updated.courses);
					await this.events.emit('timetable:updated', { timetable: updated });
				}
			}
		}
	}

	updateTime(now = new Date()): void {
		const todayIso = formatIsoDate(now);
		const academicConfig = this._currentTimetable?.academicConfig;

		const currentWeek = academicConfig
			? this.calendarService.calculateAcademicWeek(todayIso, academicConfig)
			: 1;

		let currentPeriod: number | null = null;
		if (academicConfig?.periodTimes && academicConfig.periodTimes.length > 0) {
			const currentMinutes = now.getHours() * 60 + now.getMinutes();
			for (const period of academicConfig.periodTimes) {
				const [sH, sM] = period.startTime.split(':').map((v) => Number.parseInt(v, 10));
				const [eH, eM] = period.endTime.split(':').map((v) => Number.parseInt(v, 10));
				if (sH !== undefined && sM !== undefined && eH !== undefined && eM !== undefined) {
					const startMinutes = sH * 60 + sM;
					const endMinutes = eH * 60 + eM;
					if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
						currentPeriod = period.index;
						break;
					}
				}
			}
		}

		const changed = currentWeek !== this._activeWeek || currentPeriod !== this._currentPeriodIndex;

		this._activeWeek = currentWeek;
		this._currentPeriodIndex = currentPeriod;

		if (changed) {
			void this.events.emit('time:tick', { currentWeek, currentPeriod });
		}
	}

	async createTimetable(name: string, config?: Partial<AcademicConfig>): Promise<Timetable> {
		const id = `tt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		const timetable = createTimetable({
			id,
			name,
			academicConfig: {
				termStartDate: config?.termStartDate ?? '',
				startWeek: config?.startWeek ?? 1,
				endWeek: config?.endWeek ?? 20,
				periodTimes: config?.periodTimes ?? []
			}
		});

		await this.storage.saveTimetable(timetable);

		if (!this._currentTimetable) {
			await this.switchTimetable(timetable.id);
		}

		return timetable;
	}

	async switchTimetable(timetableId: string): Promise<void> {
		const previousId = this._currentTimetable?.id ?? null;
		const timetable = await this.storage.getTimetable(timetableId);
		if (!timetable) {
			throw new Error(`Timetable not found: ${timetableId}`);
		}

		await this.storage.setActiveTimetableId(timetableId);
		this._currentTimetable = timetable;
		this.updateTime();
		await this.badges.recalculate(timetable.courses);

		await this.events.emit('timetable:switched', {
			previousId,
			currentId: timetableId,
			timetable
		});
	}

	async deleteTimetable(timetableId: string): Promise<void> {
		await this.storage.deleteTimetable(timetableId);

		if (this._currentTimetable?.id === timetableId) {
			const remaining = await this.storage.listTimetables();
			if (remaining.length > 0 && remaining[0]) {
				await this.switchTimetable(remaining[0].id);
			} else {
				this._currentTimetable = null;
				await this.storage.setActiveTimetableId('');
			}
		}
	}

	async saveCurrentTimetableDetails(patch: Partial<Timetable>): Promise<void> {
		if (!this._currentTimetable) {
			throw new Error('No active timetable to update');
		}

		const updated: Timetable = {
			...this._currentTimetable,
			...patch,
			updatedAt: Date.now()
		};

		await this.storage.saveTimetable(updated);
		this._currentTimetable = updated;
		this.updateTime();
		await this.badges.recalculate(updated.courses);
		await this.events.emit('timetable:updated', { timetable: updated });
	}

	async saveCourse(course: Course): Promise<void> {
		if (!this._currentTimetable) {
			throw new Error('No active timetable to save course');
		}

		const courses = [...this._currentTimetable.courses];
		const index = courses.findIndex((c) => c.id === course.id);
		if (index >= 0) {
			courses[index] = course;
		} else {
			courses.push(course);
		}

		await this.saveCurrentTimetableDetails({ courses });
	}

	async updateCourse(courseId: string, patch: Partial<Course>): Promise<void> {
		if (!this._currentTimetable) {
			throw new Error('No active timetable to update course');
		}

		const courses = this._currentTimetable.courses.map((c) =>
			c.id === courseId ? { ...c, ...patch } : c
		);

		await this.saveCurrentTimetableDetails({ courses });
	}

	async deleteCourse(courseId: string): Promise<void> {
		if (!this._currentTimetable) {
			throw new Error('No active timetable to delete course');
		}

		const courses = this._currentTimetable.courses.filter((c) => c.id !== courseId);
		await this.saveCurrentTimetableDetails({ courses });
	}

	setTheme(themeId: string): void {
		this._activeThemeId = themeId;
		void this.events.emit('theme:changed', { themeId });
	}

	async updatePreferences(patch: Partial<UserPreferences>): Promise<void> {
		this._userPreferences = {
			...this._userPreferences,
			...patch
		};
		await this.storage.savePreferences(this._userPreferences);
		await this.events.emit('preferences:updated', { preferences: this._userPreferences });
	}

	notify(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
		this._onNotification?.(message, type);
	}

	getPluginContext(pluginId: string): ScopedContext<Record<string, unknown>> {
		const entry = this.loadedPlugins.get(pluginId);
		if (entry) {
			return entry.context;
		}
		return new ScopedContext<Record<string, unknown>>(pluginId, this);
	}

	async loadPlugin<Config extends object = Record<string, unknown>>(
		plugin: ChronosPlugin<Config>
	): Promise<Disposable> {
		if (this.loadedPlugins.has(plugin.id)) {
			await this.unloadPlugin(plugin.id);
		}

		let initialConfig: Config = { ...(plugin.defaultConfig ?? ({} as Config)) };
		try {
			const savedConfig = await this.storage.getPluginData<Config>(plugin.id, '__config__');
			if (savedConfig) {
				initialConfig = { ...initialConfig, ...savedConfig };
			}
		} catch (err) {
			console.warn(`[ChronosEngine] Failed to load saved config for plugin "${plugin.id}":`, err);
		}

		const context = new ScopedContext<Config>(plugin.id, this, initialConfig);
		await plugin.apply(context);
		this.loadedPlugins.set(plugin.id, {
			plugin: plugin as unknown as ChronosPlugin<Record<string, unknown>>,
			context: context as unknown as ScopedContext<Record<string, unknown>>
		});

		await this.events.emit('plugin:loaded', { pluginId: plugin.id });

		return {
			dispose: () => {
				void this.unloadPlugin(plugin.id);
			}
		};
	}

	async unloadPlugin(pluginId: string): Promise<void> {
		const entry = this.loadedPlugins.get(pluginId);
		if (!entry) return;

		this.loadedPlugins.delete(pluginId);
		entry.context.dispose();
		try {
			await entry.plugin.dispose?.();
		} catch (error) {
			console.error(`[ChronosEngine] Error in plugin "${pluginId}" dispose hook:`, error);
		}

		await this.events.emit('plugin:unloaded', { pluginId });
	}

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		return this.events.on(event, handler);
	}

	dispose(): void {
		for (const [pluginId, entry] of this.loadedPlugins) {
			try {
				entry.context.dispose();
				void entry.plugin.dispose?.();
			} catch (error) {
				console.error(`[ChronosEngine] Error disposing plugin ${pluginId}:`, error);
			}
		}
		this.loadedPlugins.clear();

		this.storageSubscription?.dispose();
		this.storageSubscription = undefined;

		this.events.dispose();
		this.pipeline.dispose();
		this.slots.dispose();
		this.themes.dispose();
		this.badges.dispose();
		this.services.dispose();
	}
}
