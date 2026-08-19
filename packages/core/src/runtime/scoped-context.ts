import type { Course } from '../domain/course';
import type { AcademicConfig, Timetable } from '../domain/timetable';
import type { UserPreferences } from '../domain/preferences';
import type { ChronosEnv, Disposable } from '../types/env';
import type { ChronosContext, ChronosEvents, ExportTransformHook } from '../types/context';
import type {
	CourseActionContribution,
	CourseBadgeContribution,
	ThemeContribution,
	TimetableExporterAdapter,
	TimetableSourceAdapter
} from '../types/contributions';
import type { EventBus } from './event-bus';
import type { Pipeline } from './pipeline';
import type { SlotRegistry } from './slot-registry';
import type { ThemeRegistry } from './theme-registry';
import type { BadgeManager } from './badge-manager';

export interface EngineContextHost {
	readonly env: ChronosEnv;
	readonly events: EventBus;
	readonly pipeline: Pipeline;
	readonly slots: SlotRegistry;
	readonly themes: ThemeRegistry;
	readonly badges: BadgeManager;
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

export class ScopedContext implements ChronosContext, Disposable {
	readonly env: Readonly<ChronosEnv>;
	readonly storage: {
		get<T = unknown>(key: string): Promise<T | null>;
		set<T = unknown>(key: string, value: T): Promise<void>;
		delete(key: string): Promise<void>;
	};
	readonly i18n: {
		readonly locale: string;
		t(key: string, params?: Record<string, unknown>): string;
	};
	readonly subscriptions: Disposable[] = [];

	constructor(
		readonly pluginId: string,
		private host: EngineContextHost
	) {
		this.env = host.env;

		this.storage = {
			get: <T = unknown>(key: string) => this.host.env.storage.getPluginData<T>(this.pluginId, key),
			set: <T = unknown>(key: string, value: T) =>
				this.host.env.storage.setPluginData<T>(this.pluginId, key, value),
			delete: (key: string) => this.host.env.storage.deletePluginData(this.pluginId, key)
		};

		this.i18n = {
			get locale() {
				return host.locale;
			},
			t: (key: string, params?: Record<string, unknown>) => host.t(key, params)
		};
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

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		return this.track(this.host.events.on(event, handler));
	}

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
		return this.track(this.host.badges.registerCourseBadge(badge));
	}

	registerTheme(theme: ThemeContribution): Disposable {
		return this.track(this.host.themes.registerTheme(theme));
	}

	dispose(): void {
		for (const subscription of this.subscriptions.slice()) {
			try {
				subscription.dispose();
			} catch (error) {
				console.error(`[ScopedContext] Error disposing subscription in "${this.pluginId}":`, error);
			}
		}
		this.subscriptions.length = 0;
	}
}
