import { describe, expect, it } from 'vite-plus/test';
import { CapsuleCornerStyle, PaletteMode } from '$lib/models/app-state';
import { createSettingsRepo } from './settings-repo';

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
	const map = new Map(Object.entries(initial));
	return {
		getItem: (key: string) => map.get(key) ?? null,
		setItem: (key: string, value: string) => {
			map.set(key, value);
		},
		removeItem: (key: string) => {
			map.delete(key);
		},
		clear: () => map.clear(),
		key: (index: number) => [...map.keys()][index] ?? null,
		get length() {
			return map.size;
		}
	} as Storage;
}

describe('createSettingsRepo paletteMode', () => {
	it('defaults to DEFAULT when storage is empty', () => {
		const repo = createSettingsRepo(createMemoryStorage());
		expect(repo.getSnapshot().paletteMode).toBe(PaletteMode.DEFAULT);
	});

	it('reads palette_mode from storage', () => {
		const repo = createSettingsRepo(
			createMemoryStorage({ 'chronos_preferences:palette_mode': 'random' })
		);
		expect(repo.getSnapshot().paletteMode).toBe(PaletteMode.RANDOM);
	});

	it('writes palette_mode to storage', () => {
		const storage = createMemoryStorage();
		const repo = createSettingsRepo(storage);
		repo.setPaletteMode(PaletteMode.WALLPAPER);
		expect(storage.getItem('chronos_preferences:palette_mode')).toBe('wallpaper');
		expect(repo.getSnapshot().paletteMode).toBe(PaletteMode.WALLPAPER);
	});
});

describe('createSettingsRepo capsuleCornerStyle', () => {
	it('defaults to ROUNDED when storage is empty', () => {
		const repo = createSettingsRepo(createMemoryStorage());
		expect(repo.getSnapshot().capsuleCornerStyle).toBe(CapsuleCornerStyle.ROUNDED);
	});

	it('reads merge and square from storage', () => {
		const repo = createSettingsRepo(
			createMemoryStorage({ 'chronos_preferences:capsule_corner_style': 'merge' })
		);
		expect(repo.getSnapshot().capsuleCornerStyle).toBe(CapsuleCornerStyle.MERGE);
	});

	it('writes capsule_corner_style to storage', () => {
		const storage = createMemoryStorage();
		const repo = createSettingsRepo(storage);
		repo.setCapsuleCornerStyle(CapsuleCornerStyle.SQUARE);
		expect(storage.getItem('chronos_preferences:capsule_corner_style')).toBe('square');
		expect(repo.getSnapshot().capsuleCornerStyle).toBe(CapsuleCornerStyle.SQUARE);
	});
});

describe('createSettingsRepo hapticFeedbackEnabled', () => {
	it('defaults to true when storage is empty', () => {
		const repo = createSettingsRepo(createMemoryStorage());
		expect(repo.getSnapshot().hapticFeedbackEnabled).toBe(true);
	});

	it('reads false from storage with "0" or "false"', () => {
		const repo1 = createSettingsRepo(
			createMemoryStorage({ 'chronos_preferences:haptic_feedback_enabled': '0' })
		);
		expect(repo1.getSnapshot().hapticFeedbackEnabled).toBe(false);

		const repo2 = createSettingsRepo(
			createMemoryStorage({ 'chronos_preferences:haptic_feedback_enabled': 'false' })
		);
		expect(repo2.getSnapshot().hapticFeedbackEnabled).toBe(false);
	});

	it('writes haptic_feedback_enabled to storage', () => {
		const storage = createMemoryStorage();
		const repo = createSettingsRepo(storage);
		repo.setHapticFeedbackEnabled(false);
		expect(storage.getItem('chronos_preferences:haptic_feedback_enabled')).toBe('0');
		expect(repo.getSnapshot().hapticFeedbackEnabled).toBe(false);

		repo.setHapticFeedbackEnabled(true);
		expect(storage.getItem('chronos_preferences:haptic_feedback_enabled')).toBe('1');
		expect(repo.getSnapshot().hapticFeedbackEnabled).toBe(true);
	});
});

describe('createSettingsRepo update batch patch', () => {
	it('updates multiple preferences atomically and notifies subscribers once', () => {
		const storage = createMemoryStorage();
		const repo = createSettingsRepo(storage);
		let notifyCount = 0;
		repo.subscribe(() => {
			notifyCount += 1;
		});
		notifyCount = 0; // reset initial sync

		repo.update({
			capsuleCornerStyle: CapsuleCornerStyle.MERGE,
			hapticFeedbackEnabled: false,
			currentTimetableId: 'tt-123'
		});

		expect(notifyCount).toBe(1);
		expect(storage.getItem('chronos_preferences:capsule_corner_style')).toBe('merge');
		expect(storage.getItem('chronos_preferences:haptic_feedback_enabled')).toBe('0');
		expect(storage.getItem('chronos_preferences:current_timetable_id')).toBe('tt-123');

		const snapshot = repo.getSnapshot();
		expect(snapshot.capsuleCornerStyle).toBe(CapsuleCornerStyle.MERGE);
		expect(snapshot.hapticFeedbackEnabled).toBe(false);
		expect(snapshot.currentTimetableId).toBe('tt-123');
	});
});
