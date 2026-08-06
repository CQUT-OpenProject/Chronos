import { browser } from '$app/environment';
import { createOfflineTimetableRepository } from '$lib/storage/offline-repository';
import type { TimetableRepository } from '$lib/domain/interfaces/timetable-repository';

let instance: TimetableRepository | null = null;

export function getRepository(): TimetableRepository {
	if (!browser) {
		throw new Error('getRepository() is only available in the browser');
	}
	instance ??= createOfflineTimetableRepository();
	return instance;
}
