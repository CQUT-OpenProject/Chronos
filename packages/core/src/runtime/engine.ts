import type { Course } from '../domain/course';
import { type AcademicConfig, type Timetable, createTimetable } from '../domain/timetable';
import {
	type UserPreferences,
	DEFAULT_USER_PREFERENCES,
	CURRENT_PREFERENCES_SCHEMA_VERSION,
	PALETTE_MODE_VIBRANT
} from '../domain/preferences';
import { DEFAULT_VISUAL_THEME_ID, HOST_DEFAULT_ICON_THEME_ID } from '../theme/theme-defaults';
import { PLUGIN_CONFIG_STORAGE_KEY } from '../constants/plugin-storage';
import type { ChronosEnv, StorageChangeEvent } from '../types/env';
import type { Disposable } from '../types/services';
import {
	IHttpService,
	IStorageService,
	IVaultService,
	IRuntimeService,
	IAnalyticsService
} from '../types/services';
import type { ChronosPlugin } from '../types/context';
import type { ChronosEvents } from '../types/context';
import type { ChronosSlotMap } from '../types/slots';
import { EventPipeline } from './event-pipeline';
import { HierarchicalSlotRegistry } from './hierarchical-slot-registry';
import { ServiceContainer } from './service-container';
import { ThemeRegistry } from './theme-registry';
import { IconThemeRegistry } from './icon-theme-registry';
import { BadgeManager } from './badge-manager';
import { ScopedContext, type EngineContextHost } from './scoped-context';
import { AcademicCalendarService } from '../engine/calendar';
import { formatIsoDate } from '../engine/date';
import {
	currentTimeMinutes,
	findCurrentPeriodIndex,
	parsePeriodRanges
} from '../engine/period-clock';
import { I18nCatalog, interpolateMessage } from '../i18n/i18n-catalog';
import type { ThemeContribution } from '../types/contributions';

export interface ChronosEngineOptions {
	env: ChronosEnv;
	services?: ServiceContainer;
	initialLocale?: string;
	presetThemes?: ThemeContribution[];
	presetI18nCatalogs?: Array<{
		pluginId: string;
		messages: Record<string, Record<string, string>>;
	}>;
	onNotification?: (message: string, type: 'info' | 'warn' | 'error') => void;
}

export class ChronosEngine implements EngineContextHost, Disposable {
	readonly env: ChronosEnv;
	readonly services: ServiceContainer;
	readonly events: EventPipeline;
	readonly slots: HierarchicalSlotRegistry;
	readonly themes: ThemeRegistry;
	readonly iconThemes: IconThemeRegistry;
	readonly badges: BadgeManager;
	readonly i18nCatalog: I18nCatalog;

	private _locale: string;
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
	private _activeThemeId = DEFAULT_VISUAL_THEME_ID;
	private _userPreferences: UserPreferences = { ...DEFAULT_USER_PREFERENCES };

	private loadedPlugins = new Map<
		string,
		{
			plugin: ChronosPlugin<Record<string, unknown>>;
			context: ScopedContext<Record<string, unknown>>;
		}
	>();

	constructor(options: ChronosEngineOptions) {
		if (!options.env) {
			throw new Error('[ChronosEngine] env is required at construction');
		}
		this.services = options.services ?? new ServiceContainer();
		this._locale = options.initialLocale ?? 'zh-cn';
		this._onNotification = options.onNotification;
		this.i18nCatalog = new I18nCatalog();

		this.events = new EventPipeline();
		this.slots = new HierarchicalSlotRegistry(() => {
			this.events.emit('slots:updated', undefined);
		});
		this.themes = new ThemeRegistry(() => {
			this.events.emit('theme:changed', { themeId: this._activeThemeId });
			this.emitIconThemeChanged();
		});
		this.iconThemes = new IconThemeRegistry(() => {
			this.emitIconThemeChanged();
		});
		this.badges = new BadgeManager((badges) => {
			this.events.emit('badges:updated', { badges });
		});

		this.env = options.env;
		this.registerEnvProviders(this.env);

		for (const theme of options.presetThemes ?? []) {
			this.themes.registerTheme(theme);
		}
		for (const { pluginId, messages } of options.presetI18nCatalogs ?? []) {
			this.i18nCatalog.register(pluginId, messages);
		}
	}

	private storageSubscription?: Disposable;
	private calendarService = new AcademicCalendarService();

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
				sha256: env.runtime.sha256.bind(env.runtime)
			});
		}
		if (!this.services.has(IAnalyticsService) && env.analytics) {
			this.services.register(IAnalyticsService, env.analytics);
		}
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

	translateForPlugin(pluginId: string, key: string, params?: Record<string, unknown>): string {
		const fromCatalog = this.i18nCatalog.t(pluginId, key, this._locale);
		if (fromCatalog !== undefined) {
			return interpolateMessage(fromCatalog, params);
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
			activeIconThemeId: this.resolveActiveIconThemeId(),
			userPreferences: this._userPreferences
		};
	}

	get actions(): EngineContextHost['actions'] {
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
			revertToDefaultThemes: this.revertToDefaultThemes.bind(this),
			notify: this.notify.bind(this)
		};
	}

	private async refreshTimetables(): Promise<void> {
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

		const savedLocale = this._userPreferences.locale;
		if (savedLocale) {
			this._locale = savedLocale;
		}

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
		const allowed = await this.events.serial('guard:createTimetable', { name, config });
		if (!allowed) {
			throw new Error('[ChronosEngine] createTimetable action was rejected by guard');
		}

		return this.events.waterfall(
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
		const allowed = await this.events.serial('guard:importTimetable', { timetable, options });
		if (!allowed) {
			throw new Error('[ChronosEngine] importTimetable action was rejected by guard');
		}

		return this.events.waterfall(
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
		const allowed = await this.events.serial('guard:switchTimetable', { timetableId });
		if (!allowed) {
			throw new Error('[ChronosEngine] switchTimetable action was rejected by guard');
		}

		return this.events.waterfall(
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
		const allowed = await this.events.serial('guard:deleteTimetable', { timetableId });
		if (!allowed) {
			throw new Error('[ChronosEngine] deleteTimetable action was rejected by guard');
		}

		return this.events.waterfall(
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
		const allowed = await this.events.serial('guard:saveCourse', { course });
		if (!allowed) {
			throw new Error('[ChronosEngine] saveCourse action was rejected by guard');
		}

		return this.events.waterfall(
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

	// C1 suspended: saveCourse/deleteCourse use serial/waterfall guards; align updateCourse when C1 resolves.
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
		const allowed = await this.events.serial('guard:deleteCourse', { courseId });
		if (!allowed) {
			throw new Error('[ChronosEngine] deleteCourse action was rejected by guard');
		}

		return this.events.waterfall(
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
		this.emitIconThemeChanged();
	}

	private resolveActiveIconThemeId(): string {
		const recommended = this.themes.getTheme(this._activeThemeId)?.recommendedIconTheme;
		if (recommended && this.iconThemes.getIconTheme(recommended)) {
			return recommended;
		}
		return HOST_DEFAULT_ICON_THEME_ID;
	}

	private emitIconThemeChanged(): void {
		this.events.emit('iconTheme:changed', { iconThemeId: this.resolveActiveIconThemeId() });
	}

	async revertToDefaultThemes(): Promise<void> {
		const prefs = this._userPreferences;
		const activeThemeId = this._activeThemeId;
		const patch: Partial<UserPreferences> = {};
		let reverted = false;

		if (activeThemeId !== DEFAULT_VISUAL_THEME_ID && !this.themes.getTheme(activeThemeId)) {
			this.setTheme(DEFAULT_VISUAL_THEME_ID);
			patch.paletteMode = PALETTE_MODE_VIBRANT;
			patch.visualThemeId = DEFAULT_VISUAL_THEME_ID;
			reverted = true;
		}

		if (prefs.paletteMode !== PALETTE_MODE_VIBRANT && !this.themes.getTheme(prefs.paletteMode)) {
			if (!reverted) {
				this.setTheme(DEFAULT_VISUAL_THEME_ID);
			}
			patch.paletteMode = PALETTE_MODE_VIBRANT;
			patch.visualThemeId = DEFAULT_VISUAL_THEME_ID;
		}

		if (Object.keys(patch).length > 0) {
			await this.updatePreferences(patch);
		}
	}

	async updatePreferences(patch: Partial<UserPreferences>): Promise<void> {
		this._userPreferences = {
			...this._userPreferences,
			...patch,
			schemaVersion: CURRENT_PREFERENCES_SCHEMA_VERSION
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

	async loadPlugin<Config extends object = Record<string, unknown>>(
		plugin: ChronosPlugin<Config>
	): Promise<Disposable> {
		if (this.loadedPlugins.has(plugin.id)) {
			await this.unloadPlugin(plugin.id);
		}

		await this.activatePlugin(plugin as unknown as ChronosPlugin<Record<string, unknown>>);

		return {
			dispose: () => {
				void this.unloadPlugin(plugin.id);
			}
		};
	}

	private async activatePlugin(plugin: ChronosPlugin<Record<string, unknown>>): Promise<void> {
		let initialConfig: Record<string, unknown> = { ...plugin.defaultConfig };
		try {
			const savedConfig = await this.storage.getPluginData<Record<string, unknown>>(
				plugin.id,
				PLUGIN_CONFIG_STORAGE_KEY
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

	async unloadPlugin(pluginId: string): Promise<void> {
		const entry = this.loadedPlugins.get(pluginId);
		if (!entry) return;

		this.loadedPlugins.delete(pluginId);
		this.i18nCatalog.disposePlugin(pluginId);
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

		this.i18nCatalog.dispose();
		this.events.dispose();
		this.slots.dispose();
		this.themes.dispose();
		this.iconThemes.dispose();
		this.badges.dispose();
		this.services.dispose();
	}
}
