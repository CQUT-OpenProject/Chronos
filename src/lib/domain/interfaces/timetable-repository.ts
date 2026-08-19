import type { AppState } from '$lib/models/app-state';
import type { Course } from '@chronos/core';
import type { Timetable } from '$lib/models/timetable';

export interface TimetableRepository {
	subscribeAppState(listener: (state: AppState) => void): () => void;
	getAppStateSnapshot(): Promise<AppState>;
	getTimetable(id: string): Promise<Timetable | null>;
	saveTimetable(timetable: Timetable): Promise<void>;
	saveCourse(timetableId: string, course: Course): Promise<void>;
	deleteCourse(courseId: string): Promise<void>;
	deleteTimetable(id: string): Promise<void>;
}
