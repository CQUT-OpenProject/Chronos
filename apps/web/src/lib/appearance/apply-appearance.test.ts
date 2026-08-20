import { describe, expect, it, vi } from 'vite-plus/test';
import {
	COURSE_PALETTE_ENTRIES,
	EASTER_EGG_PALETTE_ENTRIES,
	type CoursePaletteEntry
} from '@chronos/core';
import { applyAppearance, type WallpaperThemeAdapter } from './apply-appearance';

function createFakeElement() {
	const classes = new Set<string>();
	return {
		classList: {
			toggle: (cls: string, force?: boolean) => {
				if (force === undefined) {
					if (classes.has(cls)) classes.delete(cls);
					else classes.add(cls);
					return;
				}
				if (force) classes.add(cls);
				else classes.delete(cls);
			},
			contains: (cls: string) => classes.has(cls)
		},
		style: {
			colorScheme: '' as string
		}
	} as unknown as HTMLElement;
}

function createWallpaperAdapter(
	overrides: {
		extractWallpaperSeed?: ReturnType<typeof vi.fn>;
		paintWallpaperTheme?: ReturnType<typeof vi.fn>;
		clearWallpaperTheme?: ReturnType<typeof vi.fn>;
	} = {}
) {
	const extractWallpaperSeed =
		overrides.extractWallpaperSeed ??
		vi.fn().mockResolvedValue({
			seed: 42,
			coursePalette: [{ background: '#abcdef', foreground: '#000' }] satisfies CoursePaletteEntry[]
		});
	const paintWallpaperTheme = overrides.paintWallpaperTheme ?? vi.fn();
	const clearWallpaperTheme = overrides.clearWallpaperTheme ?? vi.fn();
	const wallpaper = {
		extractWallpaperSeed,
		paintWallpaperTheme,
		clearWallpaperTheme
	} as WallpaperThemeAdapter;

	return { wallpaper, extractWallpaperSeed, paintWallpaperTheme, clearWallpaperTheme };
}

describe('applyAppearance', () => {
	it('applies DEFAULT chrome and returns the default course palette', async () => {
		const target = createFakeElement();
		const { wallpaper, clearWallpaperTheme } = createWallpaperAdapter();

		const result = await applyAppearance(
			{ paletteMode: 'vibrant', isDark: false, wallpaperUri: null },
			{ target, wallpaper }
		);

		expect(target.classList.contains('dark')).toBe(false);
		expect(target.classList.contains('theme-random')).toBe(false);
		expect(target.style.colorScheme).toBe('light');
		expect(clearWallpaperTheme).toHaveBeenCalledWith(target);
		expect(result.coursePalette).toBe(COURSE_PALETTE_ENTRIES);
	});

	it('applies RANDOM chrome and returns the easter-egg course palette', async () => {
		const target = createFakeElement();
		const { wallpaper, clearWallpaperTheme } = createWallpaperAdapter();

		const result = await applyAppearance(
			{ paletteMode: 'random', isDark: true, wallpaperUri: null },
			{ target, wallpaper }
		);

		expect(target.classList.contains('dark')).toBe(true);
		expect(target.classList.contains('theme-random')).toBe(true);
		expect(target.style.colorScheme).toBe('dark');
		expect(clearWallpaperTheme).toHaveBeenCalledWith(target);
		expect(result.coursePalette).toBe(EASTER_EGG_PALETTE_ENTRIES);
	});

	it('extracts and paints wallpaper theme when WALLPAPER has a uri', async () => {
		const target = createFakeElement();
		const customPalette = [{ background: '#fedcba', foreground: '#111' }];
		const extractWallpaperSeed = vi.fn().mockResolvedValue({
			seed: 99,
			coursePalette: customPalette
		});
		const { wallpaper, paintWallpaperTheme } = createWallpaperAdapter({ extractWallpaperSeed });

		const result = await applyAppearance(
			{
				paletteMode: 'wallpaper',
				isDark: false,
				wallpaperUri: 'blob:wallpaper'
			},
			{ target, wallpaper }
		);

		expect(extractWallpaperSeed).toHaveBeenCalledWith('blob:wallpaper');
		expect(paintWallpaperTheme).toHaveBeenCalledWith(99, false, target);
		expect(result.coursePalette).toBe(customPalette);
	});

	it('clears wallpaper theme and falls back when WALLPAPER has no uri', async () => {
		const target = createFakeElement();
		const { wallpaper, extractWallpaperSeed, paintWallpaperTheme, clearWallpaperTheme } =
			createWallpaperAdapter();

		const result = await applyAppearance(
			{ paletteMode: 'wallpaper', isDark: false, wallpaperUri: null },
			{ target, wallpaper }
		);

		expect(extractWallpaperSeed).not.toHaveBeenCalled();
		expect(paintWallpaperTheme).not.toHaveBeenCalled();
		expect(clearWallpaperTheme).toHaveBeenCalledWith(target);
		expect(result.coursePalette).toBe(COURSE_PALETTE_ENTRIES);
	});

	it('clears wallpaper theme and falls back when extract throws', async () => {
		const target = createFakeElement();
		const extractWallpaperSeed = vi.fn().mockRejectedValue(new Error('decode failed'));
		const { wallpaper, paintWallpaperTheme, clearWallpaperTheme } = createWallpaperAdapter({
			extractWallpaperSeed
		});

		const result = await applyAppearance(
			{
				paletteMode: 'wallpaper',
				isDark: true,
				wallpaperUri: 'blob:broken'
			},
			{ target, wallpaper }
		);

		expect(paintWallpaperTheme).not.toHaveBeenCalled();
		expect(clearWallpaperTheme).toHaveBeenCalledWith(target);
		expect(result.coursePalette).toBe(COURSE_PALETTE_ENTRIES);
	});

	it('does not paint after abort', async () => {
		const target = createFakeElement();
		const controller = new AbortController();
		const extractWallpaperSeed = vi.fn().mockImplementation(async () => {
			controller.abort();
			return {
				seed: 1,
				coursePalette: [{ background: '#111111', foreground: '#fff' }]
			};
		});
		const { wallpaper, paintWallpaperTheme } = createWallpaperAdapter({ extractWallpaperSeed });

		await expect(
			applyAppearance(
				{
					paletteMode: 'wallpaper',
					isDark: false,
					wallpaperUri: 'blob:wallpaper'
				},
				{ target, wallpaper, signal: controller.signal }
			)
		).rejects.toMatchObject({ name: 'AbortError' });

		expect(paintWallpaperTheme).not.toHaveBeenCalled();
	});
});
