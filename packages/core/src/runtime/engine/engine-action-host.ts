import type { Timetable } from '../../domain/timetable';
import type { UserPreferences } from '../../domain/preferences';
import type { ChronosEvents } from '../../types/context';
import type { IStorageService } from '../../types/services';
import type { BadgeManager } from '../badge-manager';
import type { EventPipeline } from '../event-pipeline';
import type { ThemeRegistry } from '../theme-registry';

export interface TimetableListEntry {
	id: string;
	name: string;
	courseCount?: number;
	updatedAt: number;
}

/** Narrow host surface for extracted engine action modules. */
export interface EngineActionHost {
	readonly storage: IStorageService;
	readonly events: EventPipeline;
	readonly badges: BadgeManager;
	readonly themes: ThemeRegistry;

	getCurrentTimetable(): Timetable | null;
	setCurrentTimetable(timetable: Timetable | null): void;
	getTimetables(): TimetableListEntry[];
	setTimetables(timetables: TimetableListEntry[]): void;
	getUserPreferences(): UserPreferences;
	setUserPreferences(preferences: UserPreferences): void;
	getActiveThemeId(): string;
	setActiveThemeId(themeId: string): void;
	getLocale(): string;
	setLocale(locale: string): void;

	refreshTimetables(): Promise<void>;
	updateTime(now?: Date): void;
	rescheduleDayClock(): void;
	emitIconThemeChanged(): void;
	switchTimetable(timetableId: string): Promise<void>;
	saveCurrentTimetableDetails(patch: Partial<Timetable>): Promise<void>;
	updatePreferences(patch: Partial<UserPreferences>): Promise<void>;

	emit<E extends keyof ChronosEvents>(event: E, payload: ChronosEvents[E]): void;
}
