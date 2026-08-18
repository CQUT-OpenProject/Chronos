import { browser } from '$app/environment';
import {
	createOfflineTimetableRepository,
	createPreferencesRepository
} from '$lib/storage/offline-repository';
import { clearAllAppData as clearAllAppDataImpl } from '$lib/storage/clear-app-data';
import { createSettingsRepo, type SettingsRepo } from '$lib/storage/settings-repo';
import type { PreferencesRepository } from '$lib/domain/interfaces/preferences-repository';
import type { TimetableRepository } from '$lib/domain/interfaces/timetable-repository';

let settings: SettingsRepo | null = null;
let timetableRepository: TimetableRepository | null = null;
let preferencesRepository: PreferencesRepository | null = null;

export function getSharedSettings(): SettingsRepo {
	settings ??= createSettingsRepo();
	return settings;
}

export function getRepository(): TimetableRepository {
	if (!browser) {
		throw new Error('getRepository() is only available in the browser');
	}
	timetableRepository ??= createOfflineTimetableRepository(getSharedSettings());
	return timetableRepository;
}

export function getPreferencesRepository(): PreferencesRepository {
	if (!browser) {
		throw new Error('getPreferencesRepository() is only available in the browser');
	}
	getRepository();
	preferencesRepository ??= createPreferencesRepository(getSharedSettings());
	return preferencesRepository;
}

export async function clearAllAppData(): Promise<void> {
	if (!browser) {
		throw new Error('clearAllAppData() is only available in the browser');
	}
	getRepository();
	await clearAllAppDataImpl(getSharedSettings());
}
