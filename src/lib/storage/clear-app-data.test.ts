import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
	CapsuleCornerStyle,
	PaletteMode,
	ThemeMode,
	TimetableLayoutMode
} from '$lib/models/app-state';
import {
	clearAllAppData,
	estimateStorageBytes,
	formatAppDataSize,
	removeStorageKeysWithPrefix
} from './clear-app-data';
import type { SettingsRepo } from './settings-repo';

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
	const map = new Map(Object.entries(initial));
	return {
		getItem: (key: string) => map.get(key) ?? null,
		setItem: (key: string, value: string) => map.set(key, value),
		removeItem: (key: string) => map.delete(key),
		clear: () => map.clear(),
		key: (index: number) => [...map.keys()][index] ?? null,
		get length() {
			return map.size;
		}
	} as Storage;
}

const {
	mockTimetablesClear,
	mockCoursesClear,
	mockWallpapersClear,
	mockInvalidateWallpaperDisplayUrl,
	mockRefreshRegisteredAppState
} = vi.hoisted(() => ({
	mockTimetablesClear: vi.fn(async () => undefined),
	mockCoursesClear: vi.fn(async () => undefined),
	mockWallpapersClear: vi.fn(async () => undefined),
	mockInvalidateWallpaperDisplayUrl: vi.fn(),
	mockRefreshRegisteredAppState: vi.fn(async () => undefined)
}));

vi.mock('./db', () => ({
	db: {
		transaction: vi.fn(async (...args: unknown[]) => {
			const callback = args.at(-1) as () => Promise<void>;
			await callback();
		}),
		timetables: { clear: mockTimetablesClear },
		courses: { clear: mockCoursesClear },
		wallpapers: { clear: mockWallpapersClear }
	}
}));

vi.mock('./offline-repository', () => ({
	invalidateWallpaperDisplayUrl: mockInvalidateWallpaperDisplayUrl,
	refreshRegisteredAppState: mockRefreshRegisteredAppState
}));

describe('removeStorageKeysWithPrefix', () => {
	it('removes only keys with the given prefix', () => {
		const storage = createMemoryStorage({
			'chronos:preview': '1',
			'chronos_preferences:theme_mode': 'dark',
			'other:key': 'keep'
		});

		removeStorageKeysWithPrefix(storage, 'chronos');

		expect(storage.getItem('chronos:preview')).toBeNull();
		expect(storage.getItem('chronos_preferences:theme_mode')).toBeNull();
		expect(storage.getItem('other:key')).toBe('keep');
	});
});

describe('clearAllAppData', () => {
	let reloadFromStorageCalls = 0;
	let settings: SettingsRepo;

	beforeEach(() => {
		vi.clearAllMocks();
		reloadFromStorageCalls = 0;
		settings = {
			subscribe: vi.fn(() => () => undefined),
			getSnapshot: vi.fn(() => ({
				currentTimetableId: null,
				themeMode: ThemeMode.SYSTEM,
				timetableLayoutMode: TimetableLayoutMode.SCROLL,
				paletteMode: PaletteMode.DEFAULT,
				capsuleCornerStyle: CapsuleCornerStyle.ROUNDED,
				hapticFeedbackEnabled: true
			})),
			reloadFromStorage() {
				reloadFromStorageCalls += 1;
			},
			setCurrentTimetableId: vi.fn(),
			setThemeMode: vi.fn(),
			setTimetableLayoutMode: vi.fn(),
			setPaletteMode: vi.fn(),
			setCapsuleCornerStyle: vi.fn(),
			setHapticFeedbackEnabled: vi.fn()
		};
		vi.stubGlobal('localStorage', createMemoryStorage({ 'chronos:credential': 'x' }));
		vi.stubGlobal('sessionStorage', createMemoryStorage({ 'chronos:import-preview': 'y' }));
	});

	it('clears indexeddb tables, chronos storage keys, and refreshes app state', async () => {
		await clearAllAppData(settings);

		expect(mockInvalidateWallpaperDisplayUrl).toHaveBeenCalledOnce();
		expect(mockTimetablesClear).toHaveBeenCalledOnce();
		expect(mockCoursesClear).toHaveBeenCalledOnce();
		expect(mockWallpapersClear).toHaveBeenCalledOnce();
		expect(localStorage.getItem('chronos:credential')).toBeNull();
		expect(sessionStorage.getItem('chronos:import-preview')).toBeNull();
		expect(reloadFromStorageCalls).toBe(1);
		expect(mockRefreshRegisteredAppState).toHaveBeenCalledOnce();
	});
});

describe('estimateStorageBytes', () => {
	it('sums utf-8 byte length for keys and values with the given prefix', () => {
		const storage = createMemoryStorage({
			'chronos:preview': 'ab',
			'chronos_preferences:theme_mode': 'dark',
			'other:key': 'ignored'
		});

		expect(estimateStorageBytes(storage, 'chronos')).toBe(
			new TextEncoder().encode('chronos:preview').length +
				new TextEncoder().encode('ab').length +
				new TextEncoder().encode('chronos_preferences:theme_mode').length +
				new TextEncoder().encode('dark').length
		);
	});
});

describe('formatAppDataSize', () => {
	it('formats bytes, kilobytes, and megabytes', () => {
		expect(formatAppDataSize(512)).toBe('512 B');
		expect(formatAppDataSize(1536)).toBe('1.5 KB');
		expect(formatAppDataSize(2 * 1024 * 1024)).toBe('2.0 MB');
	});
});
