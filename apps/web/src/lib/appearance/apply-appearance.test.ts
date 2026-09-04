import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
	COURSE_PALETTE_ENTRIES,
	type CoursePaletteEntry,
	type DynamicColorAdapter
} from '@chronos/core';
import colorsJson from '@chronos/plugin-theme-yumemita/colors.json';

const YUMEMITA_THEME_ID = 'yumemita';
const YUMEMITA_PALETTE_ENTRIES = colorsJson.coursePalette.light;
import { applyAppearance, THEME_COLOR_DARK, THEME_COLOR_LIGHT } from './apply-appearance';

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

function createDynamicColorAdapter(
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
	const dynamicColorAdapter = {
		extractWallpaperSeed,
		paintWallpaperTheme,
		clearWallpaperTheme
	} as DynamicColorAdapter;

	return { dynamicColorAdapter, extractWallpaperSeed, paintWallpaperTheme, clearWallpaperTheme };
}

describe('applyAppearance', () => {
	it('applies DEFAULT chrome and returns the default course palette', async () => {
		const target = createFakeElement();
		const { dynamicColorAdapter, clearWallpaperTheme } = createDynamicColorAdapter();

		const result = await applyAppearance(
			{
				paletteMode: 'vibrant',
				isDark: false,
				dynamicColorUri: null,
				activeThemeId: 'm3-default'
			},
			{ target, dynamicColorAdapter }
		);

		expect(target.classList.contains('dark')).toBe(false);
		expect(target.style.colorScheme).toBe('light');
		expect(clearWallpaperTheme).toHaveBeenCalledWith(target);
		expect(result.coursePalette).toBe(COURSE_PALETTE_ENTRIES);
	});

	it('returns the custom theme course palette when themePaletteEntries is provided', async () => {
		const target = createFakeElement();
		const { dynamicColorAdapter, clearWallpaperTheme } = createDynamicColorAdapter();

		const result = await applyAppearance(
			{
				paletteMode: 'vibrant',
				isDark: true,
				dynamicColorUri: null,
				activeThemeId: YUMEMITA_THEME_ID,
				themePaletteEntries: YUMEMITA_PALETTE_ENTRIES
			},
			{ target, dynamicColorAdapter }
		);

		expect(target.classList.contains('dark')).toBe(true);
		expect(target.style.colorScheme).toBe('dark');
		expect(clearWallpaperTheme).toHaveBeenCalledWith(target);
		expect(result.coursePalette).toBe(YUMEMITA_PALETTE_ENTRIES);
	});

	it('does not paint dynamic color when paletteMode is vibrant but uri exists', async () => {
		const target = createFakeElement();
		const extractWallpaperSeed = vi.fn();
		const { dynamicColorAdapter, paintWallpaperTheme, clearWallpaperTheme } =
			createDynamicColorAdapter({
				extractWallpaperSeed
			});

		const result = await applyAppearance(
			{
				paletteMode: 'vibrant',
				isDark: false,
				dynamicColorUri: 'blob:wallpaper',
				activeThemeId: 'm3-default'
			},
			{ target, dynamicColorAdapter }
		);

		expect(extractWallpaperSeed).not.toHaveBeenCalled();
		expect(paintWallpaperTheme).not.toHaveBeenCalled();
		expect(clearWallpaperTheme).toHaveBeenCalledWith(target);
		expect(result.coursePalette).toBe(COURSE_PALETTE_ENTRIES);
	});

	it('prefers dynamic color palette over active theme palette entries', async () => {
		const target = createFakeElement();
		const customPalette = [{ background: '#fedcba', foreground: '#111' }];
		const extractWallpaperSeed = vi.fn().mockResolvedValue({
			seed: 7,
			coursePalette: customPalette
		});
		const { dynamicColorAdapter, paintWallpaperTheme, clearWallpaperTheme } =
			createDynamicColorAdapter({
				extractWallpaperSeed
			});

		const result = await applyAppearance(
			{
				paletteMode: 'wallpaper',
				isDark: false,
				dynamicColorUri: 'blob:wallpaper',
				activeThemeId: YUMEMITA_THEME_ID,
				themePaletteEntries: YUMEMITA_PALETTE_ENTRIES
			},
			{ target, dynamicColorAdapter }
		);

		expect(extractWallpaperSeed).toHaveBeenCalledWith('blob:wallpaper');
		expect(paintWallpaperTheme).toHaveBeenCalledWith(7, false, target);
		expect(clearWallpaperTheme).not.toHaveBeenCalledWith(target);
		expect(result.coursePalette).toBe(customPalette);
	});

	it('extracts and paints dynamic color theme when wallpaper palette has a uri', async () => {
		const target = createFakeElement();
		const customPalette = [{ background: '#fedcba', foreground: '#111' }];
		const extractWallpaperSeed = vi.fn().mockResolvedValue({
			seed: 99,
			coursePalette: customPalette
		});
		const { dynamicColorAdapter, paintWallpaperTheme } = createDynamicColorAdapter({
			extractWallpaperSeed
		});

		const result = await applyAppearance(
			{
				paletteMode: 'wallpaper',
				isDark: false,
				dynamicColorUri: 'blob:wallpaper',
				activeThemeId: 'm3-default'
			},
			{ target, dynamicColorAdapter }
		);

		expect(extractWallpaperSeed).toHaveBeenCalledWith('blob:wallpaper');
		expect(paintWallpaperTheme).toHaveBeenCalledWith(99, false, target);
		expect(result.coursePalette).toBe(customPalette);
	});

	it('clears dynamic color theme and falls back when wallpaper palette has no uri', async () => {
		const target = createFakeElement();
		const { dynamicColorAdapter, extractWallpaperSeed, paintWallpaperTheme, clearWallpaperTheme } =
			createDynamicColorAdapter();

		const result = await applyAppearance(
			{
				paletteMode: 'wallpaper',
				isDark: false,
				dynamicColorUri: null,
				activeThemeId: 'm3-default'
			},
			{ target, dynamicColorAdapter }
		);

		expect(extractWallpaperSeed).not.toHaveBeenCalled();
		expect(paintWallpaperTheme).not.toHaveBeenCalled();
		expect(clearWallpaperTheme).toHaveBeenCalledWith(target);
		expect(result.coursePalette).toBe(COURSE_PALETTE_ENTRIES);
	});

	it('clears dynamic color theme and falls back when extract throws', async () => {
		const target = createFakeElement();
		const extractWallpaperSeed = vi.fn().mockRejectedValue(new Error('decode failed'));
		const { dynamicColorAdapter, paintWallpaperTheme, clearWallpaperTheme } =
			createDynamicColorAdapter({
				extractWallpaperSeed
			});

		const result = await applyAppearance(
			{
				paletteMode: 'wallpaper',
				isDark: true,
				dynamicColorUri: 'blob:broken',
				activeThemeId: 'm3-default'
			},
			{ target, dynamicColorAdapter }
		);

		expect(paintWallpaperTheme).not.toHaveBeenCalled();
		expect(clearWallpaperTheme).toHaveBeenCalledWith(target);
		expect(result.coursePalette).toBe(COURSE_PALETTE_ENTRIES);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('syncs theme-color and apple status-bar-style when applying to documentElement', async () => {
		const themeAttrs = new Map<string, string>([['content', THEME_COLOR_LIGHT]]);
		const statusAttrs = new Map<string, string>([['content', 'default']]);
		const themeMeta = {
			getAttribute: (name: string) => themeAttrs.get(name) ?? null,
			setAttribute: (name: string, value: string) => {
				themeAttrs.set(name, value);
			}
		};
		const statusMeta = {
			getAttribute: (name: string) => statusAttrs.get(name) ?? null,
			setAttribute: (name: string, value: string) => {
				statusAttrs.set(name, value);
			}
		};
		const documentElement = createFakeElement();
		vi.stubGlobal('document', {
			documentElement,
			querySelector: (selector: string) => {
				if (selector === 'meta[name="theme-color"]') return themeMeta;
				if (selector === 'meta[name="apple-mobile-web-app-status-bar-style"]') return statusMeta;
				return null;
			}
		});

		const { dynamicColorAdapter } = createDynamicColorAdapter();

		await applyAppearance(
			{
				paletteMode: 'vibrant',
				isDark: true,
				dynamicColorUri: null,
				activeThemeId: 'm3-default'
			},
			{ target: documentElement, dynamicColorAdapter }
		);

		expect(themeMeta.getAttribute('content')).toBe(THEME_COLOR_DARK);
		expect(statusMeta.getAttribute('content')).toBe('black-translucent');
		expect(documentElement.classList.contains('dark')).toBe(true);

		await applyAppearance(
			{
				paletteMode: 'vibrant',
				isDark: false,
				dynamicColorUri: null,
				activeThemeId: 'm3-default'
			},
			{ target: documentElement, dynamicColorAdapter }
		);

		expect(themeMeta.getAttribute('content')).toBe(THEME_COLOR_LIGHT);
		expect(statusMeta.getAttribute('content')).toBe('default');
	});

	it('does not sync theme-color or status-bar meta for non-documentElement targets', async () => {
		const themeAttrs = new Map<string, string>([['content', THEME_COLOR_LIGHT]]);
		const statusAttrs = new Map<string, string>([['content', 'default']]);
		const themeMeta = {
			getAttribute: (name: string) => themeAttrs.get(name) ?? null,
			setAttribute: (name: string, value: string) => {
				themeAttrs.set(name, value);
			}
		};
		const statusMeta = {
			getAttribute: (name: string) => statusAttrs.get(name) ?? null,
			setAttribute: (name: string, value: string) => {
				statusAttrs.set(name, value);
			}
		};
		const documentElement = createFakeElement();
		vi.stubGlobal('document', {
			documentElement,
			querySelector: (selector: string) => {
				if (selector === 'meta[name="theme-color"]') return themeMeta;
				if (selector === 'meta[name="apple-mobile-web-app-status-bar-style"]') return statusMeta;
				return null;
			}
		});

		const target = createFakeElement();
		const { dynamicColorAdapter } = createDynamicColorAdapter();

		await applyAppearance(
			{
				paletteMode: 'vibrant',
				isDark: true,
				dynamicColorUri: null,
				activeThemeId: 'm3-default'
			},
			{ target, dynamicColorAdapter }
		);

		expect(themeMeta.getAttribute('content')).toBe(THEME_COLOR_LIGHT);
		expect(statusMeta.getAttribute('content')).toBe('default');
		expect(target.classList.contains('dark')).toBe(true);
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
		const { dynamicColorAdapter, paintWallpaperTheme } = createDynamicColorAdapter({
			extractWallpaperSeed
		});

		await expect(
			applyAppearance(
				{
					paletteMode: 'wallpaper',
					isDark: false,
					dynamicColorUri: 'blob:wallpaper',
					activeThemeId: 'm3-default'
				},
				{ target, dynamicColorAdapter, signal: controller.signal }
			)
		).rejects.toMatchObject({ name: 'AbortError' });

		expect(paintWallpaperTheme).not.toHaveBeenCalled();
	});
});
