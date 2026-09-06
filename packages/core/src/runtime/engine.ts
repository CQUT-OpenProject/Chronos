import type { Course } from '../domain/course';
import { type AcademicConfig, type Timetable } from '../domain/timetable';
import {
	type UserPreferences,
	DEFAULT_USER_PREFERENCES,
	CURRENT_PREFERENCES_SCHEMA_VERSION,
	PALETTE_MODE_VIBRANT
} from '../domain/preferences';
import { DEFAULT_VISUAL_THEME_ID, HOST_DEFAULT_ICON_THEME_ID } from '../theme/theme-defaults';
import type { ChronosEnv } from '../types/env';
import type { Disposable } from '../types/services';
import {
	IHttpService,
	IStorageService,
	IVaultService,
	IRuntimeService,
	IAnalyticsService,
	IHostNavigation
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
import { ScopedContext } from './scoped-context';
import type { EngineContextHost } from './engine-context-host';
import { I18nCatalog, interpolateMessage } from '../i18n/i18n-catalog';
import type { ThemeContribution } from '../types/contributions';
import type { EngineActionHost, TimetableListEntry } from './engine/engine-action-host';
import { EngineTimeKeeper } from './engine/engine-time-keeper';
import { TimetableActions } from './engine/timetable-actions';
import { CourseActions } from './engine/course-actions';
import { StorageSyncHandler } from './engine/storage-sync-handler';
import { PluginLifecycleManager } from './engine/plugin-lifecycle-manager';

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
	private _timetables: TimetableListEntry[] = [];
	private _activeWeek = 1;
	private _currentPeriodIndex: number | null = null;
	private _activeThemeId = DEFAULT_VISUAL_THEME_ID;
	private _userPreferences: UserPreferences = { ...DEFAULT_USER_PREFERENCES };

	private readonly actionHost: EngineActionHost;
	private readonly timeKeeper: EngineTimeKeeper;
	private readonly timetableActions: TimetableActions;
	private readonly courseActions: CourseActions;
	private readonly storageSync: StorageSyncHandler;
	private readonly pluginLifecycle: PluginLifecycleManager;

	private storageSubscription?: Disposable;

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

		this.actionHost = this.createActionHost();
		this.timeKeeper = new EngineTimeKeeper(
			this.events,
			() => this._currentTimetable,
			(week) => {
				this._activeWeek = week;
			},
			(index) => {
				this._currentPeriodIndex = index;
			}
		);
		this.timetableActions = new TimetableActions(this.actionHost);
		this.courseActions = new CourseActions(this.actionHost, this.timetableActions);
		this.storageSync = new StorageSyncHandler(this.actionHost, this.timeKeeper, (locale) =>
			this.setLocale(locale)
		);
		this.pluginLifecycle = new PluginLifecycleManager(
			this,
			this.storage,
			this.events,
			this.i18nCatalog
		);
	}

	private createActionHost(): EngineActionHost {
		const engine = this;
		return {
			get storage() {
				return engine.storage;
			},
			get events() {
				return engine.events;
			},
			get badges() {
				return engine.badges;
			},
			get themes() {
				return engine.themes;
			},
			getCurrentTimetable: () => engine._currentTimetable,
			setCurrentTimetable: (timetable) => {
				engine._currentTimetable = timetable;
			},
			getTimetables: () => engine._timetables,
			setTimetables: (timetables) => {
				engine._timetables = timetables;
			},
			getUserPreferences: () => engine._userPreferences,
			setUserPreferences: (preferences) => {
				engine._userPreferences = preferences;
			},
			getActiveThemeId: () => engine._activeThemeId,
			setActiveThemeId: (themeId) => {
				engine._activeThemeId = themeId;
			},
			getLocale: () => engine._locale,
			setLocale: (locale) => {
				engine._locale = locale;
			},
			refreshTimetables: () => engine.refreshTimetables(),
			updateTime: (now) => engine.updateTime(now),
			rescheduleDayClock: () => engine.timeKeeper.reschedule(),
			emitIconThemeChanged: () => engine.emitIconThemeChanged(),
			switchTimetable: (id) => engine.timetableActions.switchTimetable(id),
			saveCurrentTimetableDetails: (patch) =>
				engine.timetableActions.saveCurrentTimetableDetails(patch),
			updatePreferences: (patch) => engine.updatePreferences(patch),
			emit: (event, payload) => {
				engine.events.emit(event, payload);
			}
		};
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
				sha256: env.runtime.sha256.bind(env.runtime)
			});
		}
		if (!this.services.has(IAnalyticsService) && env.analytics) {
			this.services.register(IAnalyticsService, env.analytics);
		}
		if (!this.services.has(IHostNavigation) && env.navigation) {
			this.services.register(IHostNavigation, env.navigation);
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
		this.storageSubscription = await this.storageSync.hydrate();
	}

	async clearAllData(): Promise<void> {
		await this.storageSync.clearAllData();
	}

	updateTime(now = new Date()): void {
		this.timeKeeper.updateTime(now);
	}

	async createTimetable(name: string, config?: Partial<AcademicConfig>): Promise<Timetable> {
		return this.timetableActions.createTimetable(name, config);
	}

	async importTimetable(
		timetable: Timetable,
		options: { overwriteActive?: boolean } = {}
	): Promise<Timetable> {
		return this.timetableActions.importTimetable(timetable, options);
	}

	async switchTimetable(timetableId: string): Promise<void> {
		return this.timetableActions.switchTimetable(timetableId);
	}

	async deleteTimetable(timetableId: string): Promise<void> {
		return this.timetableActions.deleteTimetable(timetableId);
	}

	async saveCurrentTimetableDetails(patch: Partial<Timetable>): Promise<void> {
		return this.timetableActions.saveCurrentTimetableDetails(patch);
	}

	async saveCourse(course: Course): Promise<void> {
		return this.courseActions.saveCourse(course);
	}

	async updateCourse(courseId: string, patch: Partial<Course>): Promise<void> {
		return this.courseActions.updateCourse(courseId, patch);
	}

	async deleteCourse(courseId: string): Promise<void> {
		return this.courseActions.deleteCourse(courseId);
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
		return this.pluginLifecycle.getPluginContext(pluginId);
	}

	getPluginContextForSlot<K extends keyof ChronosSlotMap>(
		slotName: K,
		slotId: string
	): ScopedContext<Record<string, unknown>> {
		return this.pluginLifecycle.getPluginContextForSlot(slotName, slotId);
	}

	isPluginLoaded(pluginId: string): boolean {
		return this.pluginLifecycle.isPluginLoaded(pluginId);
	}

	async loadPlugin<Config extends object = Record<string, unknown>>(
		plugin: ChronosPlugin<Config>
	): Promise<Disposable> {
		return this.pluginLifecycle.loadPlugin(plugin);
	}

	async unloadPlugin(pluginId: string): Promise<void> {
		return this.pluginLifecycle.unloadPlugin(pluginId);
	}

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		return this.events.on(event, handler);
	}

	dispose(): void {
		this.pluginLifecycle.disposeAll();
		this.storageSubscription?.dispose();
		this.storageSubscription = undefined;
		this.timeKeeper.dispose();
		this.i18nCatalog.dispose();
		this.events.dispose();
		this.slots.dispose();
		this.themes.dispose();
		this.iconThemes.dispose();
		this.badges.dispose();
		this.services.dispose();
	}
}
