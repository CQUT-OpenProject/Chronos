import type { Course } from '../domain/course';
import type { AcademicConfig, Timetable } from '../domain/timetable';
import type { UserPreferences } from '../domain/preferences';
import type { ChronosEnv } from '../types/env';
import { PLUGIN_CONFIG_STORAGE_KEY } from '../constants/plugin-storage';
import type { Disposable, ServiceIdentifier } from '../types/services';
import { IStorageService } from '../types/services';
import type { ChronosContext, ChronosEvents } from '../types/context';
import type { ChronosSlotMap } from '../types/slots';
import type { EventPipeline } from './event-pipeline';
import type { ThemeContribution } from '../types/contributions';
import type { HierarchicalSlotRegistry } from './hierarchical-slot-registry';
import type { ServiceContainer } from './service-container';
import type { ThemeRegistry } from './theme-registry';
import type { IconThemeRegistry } from './icon-theme-registry';
import type { BadgeManager } from './badge-manager';
import type { I18nCatalog } from '../i18n/i18n-catalog';

export interface EngineContextHost {
	readonly services: ServiceContainer;
	readonly events: EventPipeline;
	readonly slots: HierarchicalSlotRegistry;
	readonly themes?: ThemeRegistry;
	readonly iconThemes?: IconThemeRegistry;
	readonly badges?: BadgeManager;
	readonly env: ChronosEnv;
	readonly i18nCatalog: I18nCatalog;
	readonly locale: string;
	translateForPlugin(pluginId: string, key: string, params?: Record<string, unknown>): string;
	readonly state: {
		readonly currentTimetable: Readonly<Timetable> | null;
		readonly activeWeek: number;
		readonly currentPeriodIndex: number | null;
		readonly activeThemeId: string;
		readonly activeIconThemeId: string;
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
		revertToDefaultThemes(): Promise<void>;
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
		registerMessages(messages: Record<string, Record<string, string>>): Disposable;
	};

	constructor(
		readonly pluginId: string,
		private host: EngineContextHost,
		initialConfig?: Config
	) {
		this._config = (initialConfig ?? {}) as Config;

		this.storage = {
			get: <T = unknown>(key: string) =>
				this.host.services.get(IStorageService).getPluginData<T>(this.pluginId, key),
			set: <T = unknown>(key: string, value: T) =>
				this.host.services.get(IStorageService).setPluginData<T>(this.pluginId, key, value),
			delete: (key: string) => {
				if (key === PLUGIN_CONFIG_STORAGE_KEY) {
					console.warn(
						`[ScopedContext:${this.pluginId}] 拒绝删除保留键 __config__，请使用 updateConfig`
					);
					return Promise.resolve();
				}
				return this.host.services.get(IStorageService).deletePluginData(this.pluginId, key);
			}
		};

		this.i18n = {
			get locale() {
				return host.locale;
			},
			t: (key: string, params?: Record<string, unknown>) =>
				host.translateForPlugin(pluginId, key, params),
			registerMessages: (messages: Record<string, Record<string, string>>) => {
				const handle = host.i18nCatalog.register(pluginId, messages);
				this.subscriptions.push(handle);
				return handle;
			}
		};
	}

	get config(): Readonly<Config> {
		return this._config;
	}

	async updateConfig(patch: Partial<Config>): Promise<void> {
		this._config = {
			...this._config,
			...patch
		};
		await this.storage.set(PLUGIN_CONFIG_STORAGE_KEY, this._config);
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
		const slotDisp = this.host.slots.register(slotName, contribution, this.pluginId);
		if (slotName === 'theme.definition' && this.host.themes) {
			const themeDisp = this.host.themes.registerTheme(
				contribution as unknown as ThemeContribution
			);
			return this.track({
				dispose: () => {
					themeDisp.dispose();
					slotDisp.dispose();
				}
			});
		}
		if (slotName === 'theme.icon.definition' && this.host.iconThemes) {
			const iconDisp = this.host.iconThemes.registerIconTheme(
				contribution as unknown as import('../theme/icon-theme').IconThemeContribution
			);
			return this.track({
				dispose: () => {
					iconDisp.dispose();
					slotDisp.dispose();
				}
			});
		}
		if (slotName === 'timetable.cell.badge' && this.host.badges) {
			const badgeDisp = this.host.badges.registerCourseBadge(
				contribution as unknown as import('../types/slots').CourseBadgeSlotContribution,
				this
			);
			return this.track({
				dispose: () => {
					badgeDisp.dispose();
					slotDisp.dispose();
				}
			});
		}
		return this.track(slotDisp);
	}

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		return this.track(this.host.events.on(event, handler));
	}

	emit<E extends keyof ChronosEvents>(event: E, payload: ChronosEvents[E]): void {
		this.host.events.emit(event, payload);
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
