import type { AppState } from '$lib/models/app-state';
import type { Course } from '$lib/models/course';
import { ThemeMode } from '$lib/models/app-state';
import type { Timetable } from '$lib/models/timetable';

export interface TimetableRepository {
	subscribeAppState(listener: (state: AppState) => void): () => void;
	getAppStateSnapshot(): Promise<AppState>;
	getTimetable(id: string): Promise<Timetable | null>;
	saveTimetable(timetable: Timetable): Promise<void>;
	saveCourse(timetableId: string, course: Course): Promise<void>;
	deleteCourse(courseId: string): Promise<void>;
	deleteTimetable(id: string): Promise<void>;
	setCurrentTimetableId(id: string | null): Promise<void>;
	setWallpaper(uri: string | null): Promise<void>;
	setThemeMode(mode: ThemeMode): Promise<void>;
	setUseDynamicColor(enabled: boolean): Promise<void>;
}
