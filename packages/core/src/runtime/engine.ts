import type { Course } from '../domain/course';
import { type AcademicConfig, type Timetable, createTimetable } from '../domain/timetable';
import { type UserPreferences, DEFAULT_USER_PREFERENCES } from '../domain/preferences';
import type { ChronosEnv, Disposable, StorageChangeEvent } from '../types/env';
import type { ChronosEvents, ChronosPlugin } from '../types/context';
import { EventBus } from './event-bus';
import { Pipeline } from './pipeline';
import { SlotRegistry } from './slot-registry';
import { ThemeRegistry } from './theme-registry';
import { BadgeManager } from './badge-manager';
import { ScopedContext, type EngineContextHost } from './scoped-context';
import { AcademicCalendarService } from '../engine/calendar';
import { formatIsoDate } from '../engine/date';

export interface ChronosEngineOptions {
	env: ChronosEnv;
	initialLocale?: string;
	i18nHandler?: (key: string, params?: Record<string, unknown>) => string;
	onNotification?: (message: string, type: 'info' | 'warn' | 'error') => void;
}

export class ChronosEngine implements EngineContextHost, Disposable {
	readonly env: ChronosEnv;
	readonly events: EventBus;
	readonly pipeline: Pipeline;
	readonly slots: SlotRegistry;
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

	private loadedPlugins = new Map<string, { plugin: ChronosPlugin; context: ScopedContext }>();
	private storageSubscription?: Disposable;
	private calendarService = new AcademicCalendarService();

	constructor(options: ChronosEngineOptions) {
		this.env = options.env;
		this._locale = options.initialLocale ?? 'zh-CN';
		this._i18nHandler = options.i18nHandler;
		this._onNotification = options.onNotification;

		this.events = new EventBus();
		this.pipeline = new Pipeline();
		this.slots = new SlotRegistry(() => {
			void this.events.emit('slots:updated', undefined);
		});
		this.themes = new ThemeRegistry();
		this.badges = new BadgeManager((badges) => {
			void this.events.emit('badges:updated', { badges });
		});
	}

	get locale(): string {
		return this._locale;
	}

	setLocale(locale: string): void {
		this._locale = locale;
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
		this._userPreferences = await this.env.storage.getPreferences();

		let activeId = await this.env.storage.getActiveTimetableId();
		if (!activeId) {
			const list = await this.env.storage.listTimetables();
			if (list.length > 0) {
				activeId = list[0]!.id;
				await this.env.storage.setActiveTimetableId(activeId);
			}
		}

		if (activeId) {
			this._currentTimetable = await this.env.storage.getTimetable(activeId);
		}

		this.updateTime();

		if (this._currentTimetable) {
			await this.badges.recalculate(this._currentTimetable.courses);
			await this.events.emit('timetable:loaded', { timetable: this._currentTimetable });
		}

		if (this.env.storage.onChanged) {
			this.storageSubscription = this.env.storage.onChanged(this.handleStorageChange.bind(this));
		}
	}

	private async handleStorageChange(event: StorageChangeEvent): Promise<void> {
		if (event.type === 'preferences') {
			this._userPreferences = await this.env.storage.getPreferences();
			await this.events.emit('preferences:updated', { preferences: this._userPreferences });
		} else if (event.type === 'timetable') {
			const activeId = await this.env.storage.getActiveTimetableId();
			if (activeId) {
				const updated = await this.env.storage.getTimetable(activeId);
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

		await this.env.storage.saveTimetable(timetable);

		if (!this._currentTimetable) {
			await this.switchTimetable(timetable.id);
		}

		return timetable;
	}

	async switchTimetable(timetableId: string): Promise<void> {
		const previousId = this._currentTimetable?.id ?? null;
		const timetable = await this.env.storage.getTimetable(timetableId);
		if (!timetable) {
			throw new Error(`Timetable not found: ${timetableId}`);
		}

		await this.env.storage.setActiveTimetableId(timetableId);
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
		await this.env.storage.deleteTimetable(timetableId);

		if (this._currentTimetable?.id === timetableId) {
			const remaining = await this.env.storage.listTimetables();
			if (remaining.length > 0 && remaining[0]) {
				await this.switchTimetable(remaining[0].id);
			} else {
				this._currentTimetable = null;
				await this.env.storage.setActiveTimetableId('');
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

		await this.env.storage.saveTimetable(updated);
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
		await this.env.storage.savePreferences(this._userPreferences);
		await this.events.emit('preferences:updated', { preferences: this._userPreferences });
	}

	notify(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
		this._onNotification?.(message, type);
	}

	async loadPlugin(plugin: ChronosPlugin): Promise<Disposable> {
		if (this.loadedPlugins.has(plugin.id)) {
			await this.unloadPlugin(plugin.id);
		}

		const context = new ScopedContext(plugin.id, this);
		await plugin.apply(context);
		this.loadedPlugins.set(plugin.id, { plugin, context });

		await this.events.emit('plugin:loaded', { pluginId: plugin.id });

		return {
			dispose: () => {
				context.dispose();
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
				void entry.plugin.dispose?.();
				entry.context.dispose();
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
	}
}
