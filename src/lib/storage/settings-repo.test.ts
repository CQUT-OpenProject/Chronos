import { describe, expect, it } from 'vite-plus/test';
import { PaletteMode } from '$lib/models/app-state';
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
	it('migrates random_theme=1 to RANDOM', () => {
		const repo = createSettingsRepo(
			createMemoryStorage({ 'chronos_preferences:random_theme': '1' })
		);
		expect(repo.getSnapshot().paletteMode).toBe(PaletteMode.RANDOM);
	});

	it('prefers palette_mode over legacy random_theme', () => {
		const repo = createSettingsRepo(
			createMemoryStorage({
				'chronos_preferences:random_theme': '1',
				'chronos_preferences:palette_mode': 'default'
			})
		);
		expect(repo.getSnapshot().paletteMode).toBe(PaletteMode.DEFAULT);
	});

	it('writes palette_mode and removes random_theme', () => {
		const storage = createMemoryStorage({ 'chronos_preferences:random_theme': '1' });
		const repo = createSettingsRepo(storage);
		repo.setPaletteMode(PaletteMode.WALLPAPER);
		expect(storage.getItem('chronos_preferences:palette_mode')).toBe('wallpaper');
		expect(storage.getItem('chronos_preferences:random_theme')).toBeNull();
		expect(repo.getSnapshot().paletteMode).toBe(PaletteMode.WALLPAPER);
	});
});
