import { db } from './db';
import type { CourseRow, TimetableRow, WallpaperRow } from './db';
import { invalidateWallpaperDisplayUrl, refreshRegisteredAppState } from './offline-repository';
import type { SettingsRepo } from './settings-repo';

const CHRONOS_STORAGE_PREFIX = 'chronos';
const textEncoder = new TextEncoder();

function listStorageKeysWithPrefix(
	storage: Pick<Storage, 'length' | 'key'>,
	prefix: string
): string[] {
	const keys: string[] = [];
	for (let index = 0; index < storage.length; index += 1) {
		const key = storage.key(index);
		if (key?.startsWith(prefix)) {
			keys.push(key);
		}
	}
	return keys;
}

export function removeStorageKeysWithPrefix(
	storage: Pick<Storage, 'length' | 'key' | 'removeItem'>,
	prefix: string
): void {
	for (const key of listStorageKeysWithPrefix(storage, prefix)) {
		storage.removeItem(key);
	}
}

export function estimateStorageBytes(
	storage: Pick<Storage, 'length' | 'key' | 'getItem'>,
	prefix: string
): number {
	let total = 0;
	for (const key of listStorageKeysWithPrefix(storage, prefix)) {
		total += textEncoder.encode(key).length;
		const value = storage.getItem(key);
		if (value) {
			total += textEncoder.encode(value).length;
		}
	}
	return total;
}

function estimateRecordBytes(record: unknown): number {
	return textEncoder.encode(JSON.stringify(record)).length;
}

async function estimateIndexedDbBytes(): Promise<number> {
	const [timetables, courses, wallpapers] = await Promise.all([
		db.timetables.toArray(),
		db.courses.toArray(),
		db.wallpapers.toArray()
	]);

	let total = 0;
	for (const row of timetables as TimetableRow[]) {
		total += estimateRecordBytes(row);
	}
	for (const row of courses as CourseRow[]) {
		total += estimateRecordBytes(row);
	}
	for (const row of wallpapers as WallpaperRow[]) {
		total += estimateRecordBytes({ id: row.id, updatedAt: row.updatedAt });
		total += row.blob.size;
	}
	return total;
}

export async function estimateAppDataBytes(): Promise<number> {
	let total = await estimateIndexedDbBytes();
	if (typeof localStorage !== 'undefined') {
		total += estimateStorageBytes(localStorage, CHRONOS_STORAGE_PREFIX);
	}
	if (typeof sessionStorage !== 'undefined') {
		total += estimateStorageBytes(sessionStorage, CHRONOS_STORAGE_PREFIX);
	}
	return total;
}

export function formatAppDataSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function clearAllAppData(settings: SettingsRepo): Promise<void> {
	invalidateWallpaperDisplayUrl();

	await db.transaction('rw', db.timetables, db.courses, db.wallpapers, async () => {
		await db.timetables.clear();
		await db.courses.clear();
		await db.wallpapers.clear();
	});

	if (typeof localStorage !== 'undefined') {
		removeStorageKeysWithPrefix(localStorage, CHRONOS_STORAGE_PREFIX);
	}
	if (typeof sessionStorage !== 'undefined') {
		removeStorageKeysWithPrefix(sessionStorage, CHRONOS_STORAGE_PREFIX);
	}

	settings.reloadFromStorage();
	await refreshRegisteredAppState();
}
