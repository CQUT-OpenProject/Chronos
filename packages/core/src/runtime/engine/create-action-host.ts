import type { Timetable } from '../../domain/timetable';
import type { UserPreferences } from '../../domain/preferences';
import type { ChronosEvents } from '../../types/context';
import type { IStorageService } from '../../types/services';
import type { BadgeManager } from '../badge-manager';
import type { EventPipeline } from '../event-pipeline';
import type { ThemeRegistry } from '../theme-registry';
import type { EngineActionHost, TimetableListEntry } from './engine-action-host';

export interface EngineActionHostSource {
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

export function createEngineActionHost(source: EngineActionHostSource): EngineActionHost {
	return {
		storage: source.storage,
		events: source.events,
		badges: source.badges,
		themes: source.themes,
		getCurrentTimetable: () => source.getCurrentTimetable(),
		setCurrentTimetable: (timetable) => source.setCurrentTimetable(timetable),
		getTimetables: () => source.getTimetables(),
		setTimetables: (timetables) => source.setTimetables(timetables),
		getUserPreferences: () => source.getUserPreferences(),
		setUserPreferences: (preferences) => source.setUserPreferences(preferences),
		getActiveThemeId: () => source.getActiveThemeId(),
		setActiveThemeId: (themeId) => source.setActiveThemeId(themeId),
		getLocale: () => source.getLocale(),
		setLocale: (locale) => source.setLocale(locale),
		refreshTimetables: () => source.refreshTimetables(),
		updateTime: (now) => source.updateTime(now),
		rescheduleDayClock: () => source.rescheduleDayClock(),
		emitIconThemeChanged: () => source.emitIconThemeChanged(),
		switchTimetable: (id) => source.switchTimetable(id),
		saveCurrentTimetableDetails: (patch) => source.saveCurrentTimetableDetails(patch),
		updatePreferences: (patch) => source.updatePreferences(patch),
		emit: (event, payload) => source.emit(event, payload)
	};
}
