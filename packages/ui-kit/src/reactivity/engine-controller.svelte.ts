/// <reference types="svelte" />
import type {
	ChronosEngine,
	Timetable,
	UserPreferences,
	Disposable,
	TimetableSourceAdapter,
	TimetableExporterAdapter,
	CourseActionContribution,
	ThemeContribution,
	CourseBadge,
	Course,
	AcademicConfig
} from '@chronos/core';

export class ReactiveChronosController implements Disposable {
	private engine: ChronosEngine;
	private disposables: Disposable[] = [];

	// Svelte 5 Runes core state reactive proxy
	currentTimetable = $state<Timetable | null>(null);
	activeWeek = $state<number>(1);
	currentPeriodIndex = $state<number | null>(null);
	activeThemeId = $state<string>('m3-default');
	userPreferences = $state<UserPreferences | null>(null);

	// Declarative extension points and badge reactive proxies
	themes = $state<ReadonlyArray<ThemeContribution>>([]);
	sources = $state<ReadonlyArray<TimetableSourceAdapter>>([]);
	exporters = $state<ReadonlyArray<TimetableExporterAdapter>>([]);
	courseActions = $state<ReadonlyArray<CourseActionContribution>>([]);
	courseBadges = $state<Record<string, CourseBadge[]>>({});

	constructor(engine: ChronosEngine) {
		this.engine = engine;
		this.syncAllState();

		// Subscribe to engine events and collect disposable handles
		this.disposables.push(
			this.engine.on('timetable:loaded', ({ timetable }: { timetable: Timetable }) => {
				this.currentTimetable = timetable;
			}),
			this.engine.on('timetable:switched', ({ timetable }: { timetable: Timetable }) => {
				this.currentTimetable = timetable;
			}),
			this.engine.on('timetable:updated', ({ timetable }: { timetable: Timetable }) => {
				this.currentTimetable = timetable;
			}),
			this.engine.on('preferences:updated', ({ preferences }: { preferences: UserPreferences }) => {
				this.userPreferences = preferences;
			}),
			this.engine.on(
				'time:tick',
				({ currentWeek, currentPeriod }: { currentWeek: number; currentPeriod: number | null }) => {
					this.activeWeek = currentWeek;
					this.currentPeriodIndex = currentPeriod;
				}
			),
			this.engine.on('theme:changed', ({ themeId }: { themeId: string }) => {
				this.activeThemeId = themeId;
			}),
			this.engine.on('slots:updated', () => {
				this.syncSlots();
			}),
			this.engine.on('badges:updated', ({ badges }: { badges: Record<string, CourseBadge[]> }) => {
				this.courseBadges = badges;
			}),
			this.engine.on('plugin:loaded', () => {
				this.syncSlots();
			}),
			this.engine.on('plugin:unloaded', () => {
				this.syncSlots();
			})
		);
	}

	get rawEngine(): ChronosEngine {
		return this.engine;
	}

	private syncAllState(): void {
		this.currentTimetable = this.engine.state.currentTimetable;
		this.activeWeek = this.engine.state.activeWeek;
		this.currentPeriodIndex = this.engine.state.currentPeriodIndex;
		this.activeThemeId = this.engine.state.activeThemeId;
		this.userPreferences = this.engine.state.userPreferences;
		this.courseBadges = this.engine.badges.getAll();
		this.syncSlots();
	}

	private syncSlots(): void {
		this.themes = this.engine.themes.getThemes();
		this.sources = this.engine.slots.getSources();
		this.exporters = this.engine.slots.getExporters();
		this.courseActions = this.engine.slots.getCourseActions();
	}

	// Action proxies
	async createTimetable(name: string, config?: Partial<AcademicConfig>): Promise<Timetable> {
		return this.engine.actions.createTimetable(name, config);
	}

	async switchTimetable(timetableId: string): Promise<void> {
		return this.engine.actions.switchTimetable(timetableId);
	}

	async deleteTimetable(timetableId: string): Promise<void> {
		return this.engine.actions.deleteTimetable(timetableId);
	}

	async saveCurrentTimetableDetails(patch: Partial<Timetable>): Promise<void> {
		return this.engine.actions.saveCurrentTimetableDetails(patch);
	}

	async saveCourse(course: Course): Promise<void> {
		return this.engine.actions.saveCourse(course);
	}

	async updateCourse(courseId: string, patch: Partial<Course>): Promise<void> {
		return this.engine.actions.updateCourse(courseId, patch);
	}

	async deleteCourse(courseId: string): Promise<void> {
		return this.engine.actions.deleteCourse(courseId);
	}

	setTheme(themeId: string): void {
		this.engine.actions.setTheme(themeId);
	}

	async updatePreferences(patch: Partial<UserPreferences>): Promise<void> {
		return this.engine.actions.updatePreferences(patch);
	}

	notify(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
		this.engine.actions.notify(message, type);
	}

	updateTime(now?: Date): void {
		this.engine.updateTime(now);
	}

	dispose(): void {
		for (const d of this.disposables) {
			d.dispose();
		}
		this.disposables = [];
	}
}
