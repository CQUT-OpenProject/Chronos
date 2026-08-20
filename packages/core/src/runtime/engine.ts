import type { Course } from '../domain/course';
import { type AcademicConfig, type Timetable, createTimetable } from '../domain/timetable';
import { type UserPreferences, DEFAULT_USER_PREFERENCES } from '../domain/preferences';
import type { ChronosEnv, StorageChangeEvent } from '../types/env';
import type { Disposable } from '../types/services';
import { IHttpService, IStorageService, IVaultService, IRuntimeService } from '../types/services';
import type { ChronosEvents, ChronosPlugin } from '../types/context';
import type { ChronosSlotMap } from '../types/slots';
import { EventPipeline } from './event-pipeline';
import { HierarchicalSlotRegistry } from './hierarchical-slot-registry';
import { ServiceContainer } from './service-container';
import { ThemeRegistry } from './theme-registry';
import { BadgeManager } from './badge-manager';
import { ScopedContext, type EngineContextHost } from './scoped-context';
import { AcademicCalendarService } from '../engine/calendar';
import { formatIsoDate } from '../engine/date';
import {
	currentTimeMinutes,
	findCurrentPeriodIndex,
	parsePeriodRanges
} from '../engine/period-clock';

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
	readonly events: EventPipeline;
	readonly pipeline: EventPipeline;
	readonly slots: HierarchicalSlotRegistry;
	readonly themes: ThemeRegistry;
	readonly badges: BadgeManager;

	private _locale: string;
	private _i18nHandler?: (key: string, params?: Record<string, unknown>) => string;
	private _onNotification?: (message: string, type: 'info' | 'warn' | 'error') => void;

	private _currentTimetable: Timetable | null = null;
	private _timetables: Array<{
		id: string;
		name: string;
		courseCount?: number;
		updatedAt: number;
	}> = [];
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
	private pendingPlugins = new Map<
		string,
		{
			plugin: ChronosPlugin<Record<string, unknown>>;
			missingDeps: Set<string>;
		}
	>();
	private serviceSubscriptions: Disposable[] = [];
	private storageSubscription?: Disposable;
	private calendarService = new AcademicCalendarService();

	constructor(options: ChronosEngineOptions) {
		this.services = options.services ?? new ServiceContainer();
		this._locale = options.initialLocale ?? 'zh-cn';
		this._i18nHandler = options.i18nHandler;
		this._onNotification = options.onNotification;

		this.events = new EventPipeline();
		this.pipeline = this.events;
		this.slots = new HierarchicalSlotRegistry(() => {
			this.events.emit('slots:updated', undefined);
		});
		this.themes = new ThemeRegistry();
		this.badges = new BadgeManager((badges) => {
			this.events.emit('badges:updated', { badges });
		});

		// Listen to service registrations for topological dependency activation
		this.serviceSubscriptions.push(
			this.services.onServiceRegistered((key) => {
				void this.handleServiceRegistered(key);
			}),
			this.services.onServiceUnregistered((key) => {
				void this.handleServiceUnregistered(key);
			})
		);

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
		this.events.emit('i18n:localeChanged', { locale });
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
			timetables: this._timetables,
			activeWeek: this._activeWeek,
			currentPeriodIndex: this._currentPeriodIndex,
			activeThemeId: this._activeThemeId,
			userPreferences: this._userPreferences
		};
	}

	get actions() {
		return {
			createTimetable: this.createTimetable.bind(this),
			importTimetable: this.importTimetable.bind(this),
			switchTimetable: this.switchTimetable.bind(this),
			deleteTimetable: this.deleteTimetable.bind(this),
			saveCurrentTimetableDetails: this.saveCurrentTimetableDetails.bind(this),
			saveCourse: this.saveCourse.bind(this),
			updateCourse: this.updateCourse.bind(this),
			deleteCourse: this.deleteCourse.bind(this),
			setTheme: this.setTheme.bind(this),
			updatePreferences: this.updatePreferences.bind(this),
			clearAllData: this.clearAllData.bind(this),
			notify: this.notify.bind(this)
		};
	}

	async refreshTimetables(): Promise<void> {
		this._timetables = await this.storage.listTimetables();
		this.events.emit('timetables:updated', { timetables: this._timetables });
	}

	async init(): Promise<void> {
		const storage = this.storage;
		this._userPreferences = await storage.getPreferences();
		this._timetables = await storage.listTimetables();

		let activeId = await storage.getActiveTimetableId();
		if (!activeId) {
			if (this._timetables.length > 0 && this._timetables[0]) {
				activeId = this._timetables[0].id;
				await storage.setActiveTimetableId(activeId);
			}
		}

		if (activeId) {
			this._currentTimetable = await storage.getTimetable(activeId);
		}

		this.updateTime();

		if (this._currentTimetable) {
			await this.badges.recalculate(this._currentTimetable.courses);
			this.events.emit('timetable:loaded', { timetable: this._currentTimetable });
		}
		this.events.emit('timetables:updated', { timetables: this._timetables });
		this.events.emit('preferences:updated', { preferences: this._userPreferences });

		if (storage.onChanged) {
			this.storageSubscription = storage.onChanged(this.handleStorageChange.bind(this));
		}
	}

	private async handleStorageChange(event: StorageChangeEvent): Promise<void> {
		const storage = this.storage;
		if (event.type === 'preferences') {
			this._userPreferences = await storage.getPreferences();
			this.events.emit('preferences:updated', { preferences: this._userPreferences });
		} else if (event.type === 'timetable') {
			await this.refreshTimetables();
			const activeId = await storage.getActiveTimetableId();
			if (activeId) {
				const updated = await storage.getTimetable(activeId);
				if (updated) {
					this._currentTimetable = updated;
					this.updateTime();
					await this.badges.recalculate(updated.courses);
					this.events.emit('timetable:updated', { timetable: updated });
				}
			} else if (this._timetables.length === 0) {
				this._currentTimetable = null;
				this.events.emit('timetable:updated', { timetable: null as unknown as Timetable });
			}
		}
	}

	async clearAllData(): Promise<void> {
		if (this.storage.clearAllData) {
			await this.storage.clearAllData();
		} else {
			const list = await this.storage.listTimetables();
			for (const t of list) {
				await this.storage.deleteTimetable(t.id);
			}
			await this.storage.setActiveTimetableId('');
			if (this.storage.setWallpaper) {
				await this.storage.setWallpaper(null);
			}
		}
		this._currentTimetable = null;
		this._timetables = [];
		this._userPreferences = { ...DEFAULT_USER_PREFERENCES };
		this.events.emit('timetables:updated', { timetables: [] });
		this.events.emit('timetable:updated', { timetable: null as unknown as Timetable });
		this.events.emit('preferences:updated', { preferences: this._userPreferences });
	}

	updateTime(now = new Date()): void {
		const todayIso = formatIsoDate(now);
		const academicConfig = this._currentTimetable?.academicConfig;

		const currentWeek = academicConfig
			? this.calendarService.calculateAcademicWeek(todayIso, academicConfig)
			: 1;

		const currentPeriod =
			academicConfig?.periodTimes && academicConfig.periodTimes.length > 0
				? findCurrentPeriodIndex(
						parsePeriodRanges(academicConfig.periodTimes),
						currentTimeMinutes(now),
						'none'
					)
				: null;

		const changed = currentWeek !== this._activeWeek || currentPeriod !== this._currentPeriodIndex;

		this._activeWeek = currentWeek;
		this._currentPeriodIndex = currentPeriod;

		if (changed) {
			this.events.emit('time:tick', { currentWeek, currentPeriod });
		}
	}

	async createTimetable(name: string, config?: Partial<AcademicConfig>): Promise<Timetable> {
		const allowed = await this.pipeline.serial('guard:createTimetable', { name, config });
		if (!allowed) {
			throw new Error('[ChronosEngine] createTimetable action was rejected by guard');
		}

		return this.pipeline.waterfall(
			'action:createTimetable',
			{ name, config },
			async ({ name: finalName, config: finalConfig }) => {
				const id = `tt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
				const timetable = createTimetable({
					id,
					name: finalName,
					academicConfig: {
						termStartDate: finalConfig?.termStartDate ?? '',
						startWeek: finalConfig?.startWeek ?? 1,
						endWeek: finalConfig?.endWeek ?? 20,
						periodTimes: finalConfig?.periodTimes ?? []
					}
				});

				await this.storage.saveTimetable(timetable);
				await this.refreshTimetables();

				if (!this._currentTimetable) {
					await this.switchTimetable(timetable.id);
				}

				return timetable;
			}
		);
	}

	async importTimetable(
		timetable: Timetable,
		options: { overwriteActive?: boolean } = {}
	): Promise<Timetable> {
		const allowed = await this.pipeline.serial('guard:importTimetable', { timetable, options });
		if (!allowed) {
			throw new Error('[ChronosEngine] importTimetable action was rejected by guard');
		}

		return this.pipeline.waterfall(
			'action:importTimetable',
			{ timetable, options },
			async ({ timetable: incoming, options: finalOptions }) => {
				let toSave = incoming;
				if (finalOptions.overwriteActive) {
					const activeId = await this.storage.getActiveTimetableId();
					if (activeId) {
						toSave = { ...incoming, id: activeId };
					}
				}

				await this.storage.saveTimetable(toSave);
				await this.refreshTimetables();
				await this.switchTimetable(toSave.id);
				return toSave;
			}
		);
	}

	async switchTimetable(timetableId: string): Promise<void> {
		const allowed = await this.pipeline.serial('guard:switchTimetable', { timetableId });
		if (!allowed) {
			throw new Error('[ChronosEngine] switchTimetable action was rejected by guard');
		}

		return this.pipeline.waterfall(
			'action:switchTimetable',
			{ timetableId },
			async ({ timetableId: targetId }) => {
				const previousId = this._currentTimetable?.id ?? null;
				const timetable = await this.storage.getTimetable(targetId);
				if (!timetable) {
					throw new Error(`Timetable not found: ${targetId}`);
				}

				await this.storage.setActiveTimetableId(targetId);
				this._currentTimetable = timetable;
				this.updateTime();
				await this.badges.recalculate(timetable.courses);

				this.events.emit('timetable:switched', {
					previousId,
					currentId: targetId,
					timetable
				});
			}
		);
	}

	async deleteTimetable(timetableId: string): Promise<void> {
		const allowed = await this.pipeline.serial('guard:deleteTimetable', { timetableId });
		if (!allowed) {
			throw new Error('[ChronosEngine] deleteTimetable action was rejected by guard');
		}

		return this.pipeline.waterfall(
			'action:deleteTimetable',
			{ timetableId },
			async ({ timetableId: targetId }) => {
				await this.storage.deleteTimetable(targetId);
				await this.refreshTimetables();

				if (this._currentTimetable?.id === targetId) {
					const remaining = await this.storage.listTimetables();
					if (remaining.length > 0 && remaining[0]) {
						await this.switchTimetable(remaining[0].id);
					} else {
						this._currentTimetable = null;
						await this.storage.setActiveTimetableId('');
						this.events.emit('timetable:updated', { timetable: null as unknown as Timetable });
					}
				}
			}
		);
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
		await this.refreshTimetables();
		this.updateTime();
		await this.badges.recalculate(updated.courses);
		this.events.emit('timetable:updated', { timetable: updated });
	}

	async saveCourse(course: Course): Promise<void> {
		if (!this._currentTimetable) {
			throw new Error('No active timetable to save course');
		}
		const allowed = await this.pipeline.serial('guard:saveCourse', { course });
		if (!allowed) {
			throw new Error('[ChronosEngine] saveCourse action was rejected by guard');
		}

		return this.pipeline.waterfall(
			'action:saveCourse',
			{ course },
			async ({ course: targetCourse }) => {
				const courses = [...this._currentTimetable!.courses];
				const index = courses.findIndex((c) => c.id === targetCourse.id);
				if (index >= 0) {
					courses[index] = targetCourse;
				} else {
					courses.push(targetCourse);
				}

				await this.saveCurrentTimetableDetails({ courses });
			}
		);
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
		const allowed = await this.pipeline.serial('guard:deleteCourse', { courseId });
		if (!allowed) {
			throw new Error('[ChronosEngine] deleteCourse action was rejected by guard');
		}

		return this.pipeline.waterfall(
			'action:deleteCourse',
			{ courseId },
			async ({ courseId: targetId }) => {
				const courses = this._currentTimetable!.courses.filter((c) => c.id !== targetId);
				await this.saveCurrentTimetableDetails({ courses });
			}
		);
	}

	setTheme(themeId: string): void {
		this._activeThemeId = themeId;
		this.events.emit('theme:changed', { themeId });
	}

	async updatePreferences(patch: Partial<UserPreferences>): Promise<void> {
		this._userPreferences = {
			...this._userPreferences,
			...patch
		};
		await this.storage.savePreferences(patch);
		this.events.emit('preferences:updated', { preferences: this._userPreferences });
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

	getPluginContextForSlot<K extends keyof ChronosSlotMap>(
		slotName: K,
		slotId: string
	): ScopedContext<Record<string, unknown>> {
		const ownerPluginId = this.slots.resolveOwner(slotName, slotId);
		if (!ownerPluginId) {
			throw new Error(`No owner plugin registered for slot ${String(slotName)}/${slotId}`);
		}
		const entry = this.loadedPlugins.get(ownerPluginId);
		if (!entry) {
			throw new Error(`Owner plugin "${ownerPluginId}" is not loaded`);
		}
		return entry.context;
	}

	isPluginLoaded(pluginId: string): boolean {
		return this.loadedPlugins.has(pluginId);
	}

	isPluginPending(pluginId: string): boolean {
		return this.pendingPlugins.has(pluginId);
	}

	async loadPlugin<Config extends object = Record<string, unknown>>(
		plugin: ChronosPlugin<Config>
	): Promise<Disposable> {
		if (this.loadedPlugins.has(plugin.id)) {
			await this.unloadPlugin(plugin.id);
		}
		this.pendingPlugins.delete(plugin.id);

		const missingDeps = new Set<string>();
		if (plugin.inject) {
			for (const dep of plugin.inject) {
				const key = typeof dep === 'string' ? dep : dep.key;
				if (!this.services.hasKey(key)) {
					missingDeps.add(key);
				}
			}
		}

		if (missingDeps.size > 0) {
			this.pendingPlugins.set(plugin.id, {
				plugin: plugin as unknown as ChronosPlugin<Record<string, unknown>>,
				missingDeps
			});
			return {
				dispose: () => {
					this.pendingPlugins.delete(plugin.id);
					void this.unloadPlugin(plugin.id);
				}
			};
		}

		await this.activatePlugin(plugin as unknown as ChronosPlugin<Record<string, unknown>>);

		return {
			dispose: () => {
				this.pendingPlugins.delete(plugin.id);
				void this.unloadPlugin(plugin.id);
			}
		};
	}

	private async activatePlugin(plugin: ChronosPlugin<Record<string, unknown>>): Promise<void> {
		if (plugin.permissions?.length) {
			const allowedInProcess = new Set(['storage', 'notifications']);
			const denied = plugin.permissions.filter((perm) => !allowedInProcess.has(perm));
			if (denied.length > 0) {
				console.warn(
					`[ChronosEngine] Plugin "${plugin.id}" requests permissions [${denied.join(', ')}] that require sandbox isolation.`
				);
			}
		}

		let initialConfig: Record<string, unknown> = { ...plugin.defaultConfig };
		try {
			const savedConfig = await this.storage.getPluginData<Record<string, unknown>>(
				plugin.id,
				'__config__'
			);
			if (savedConfig) {
				initialConfig = { ...initialConfig, ...savedConfig };
			}
		} catch (err) {
			console.warn(`[ChronosEngine] Failed to load saved config for plugin "${plugin.id}":`, err);
		}

		const context = new ScopedContext(plugin.id, this, initialConfig);
		await plugin.apply(context);
		this.loadedPlugins.set(plugin.id, {
			plugin,
			context
		});

		this.events.emit('plugin:loaded', { pluginId: plugin.id });
	}

	private async handleServiceRegistered(key: string): Promise<void> {
		for (const [pluginId, pending] of Array.from(this.pendingPlugins.entries())) {
			if (pending.missingDeps.has(key)) {
				pending.missingDeps.delete(key);
				if (pending.missingDeps.size === 0) {
					this.pendingPlugins.delete(pluginId);
					await this.activatePlugin(pending.plugin);
				}
			}
		}
	}

	private async handleServiceUnregistered(key: string): Promise<void> {
		for (const [pluginId, entry] of Array.from(this.loadedPlugins.entries())) {
			const injects = entry.plugin.inject;
			if (injects && injects.some((dep) => (typeof dep === 'string' ? dep : dep.key) === key)) {
				const missing = new Set<string>([key]);
				for (const dep of injects) {
					const depKey = typeof dep === 'string' ? dep : dep.key;
					if (!this.services.hasKey(depKey)) {
						missing.add(depKey);
					}
				}
				await this.unloadPlugin(pluginId);
				this.pendingPlugins.set(pluginId, { plugin: entry.plugin, missingDeps: missing });
			}
		}
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

		this.events.emit('plugin:unloaded', { pluginId });
	}

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		return this.events.on(event, handler);
	}

	dispose(): void {
		for (const sub of this.serviceSubscriptions) {
			sub.dispose();
		}
		this.serviceSubscriptions.length = 0;

		for (const [pluginId, entry] of this.loadedPlugins) {
			try {
				entry.context.dispose();
				void entry.plugin.dispose?.();
			} catch (error) {
				console.error(`[ChronosEngine] Error disposing plugin ${pluginId}:`, error);
			}
		}
		this.loadedPlugins.clear();
		this.pendingPlugins.clear();

		this.storageSubscription?.dispose();
		this.storageSubscription = undefined;

		this.events.dispose();
		this.slots.dispose();
		this.themes.dispose();
		this.badges.dispose();
		this.services.dispose();
	}
}
