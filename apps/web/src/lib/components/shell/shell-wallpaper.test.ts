import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vite-plus/test';
import { isShellWallpaperRevealed } from './shell-wallpaper';

const layoutCss = readFileSync(
	resolve(dirname(fileURLToPath(import.meta.url)), '../../../routes/layout.css'),
	'utf8'
);

describe('isShellWallpaperRevealed', () => {
	it('reveals only on the timetable tab with a wallpaper and a timetable', () => {
		expect(
			isShellWallpaperRevealed({
				wallpaperUri: 'blob:wallpaper',
				timetableSelected: true,
				hasTimetable: true
			})
		).toBe(true);
	});

	it('stays mounted but unrevealed on other tabs', () => {
		expect(
			isShellWallpaperRevealed({
				wallpaperUri: 'blob:wallpaper',
				timetableSelected: false,
				hasTimetable: true
			})
		).toBe(false);
	});

	it('stays unrevealed without a timetable', () => {
		expect(
			isShellWallpaperRevealed({
				wallpaperUri: 'blob:wallpaper',
				timetableSelected: true,
				hasTimetable: false
			})
		).toBe(false);
	});

	it('is unrevealed without a wallpaper uri', () => {
		expect(
			isShellWallpaperRevealed({
				wallpaperUri: null,
				timetableSelected: true,
				hasTimetable: true
			})
		).toBe(false);
	});
});

describe('shell freeze range', () => {
	it('applies content-visibility:hidden to shell-content instead of shell-root', () => {
		expect(layoutCss).toContain('.shell-content.is-frozen');
		expect(layoutCss).toMatch(/\.shell-content\.is-frozen\s*\{[^}]*content-visibility:\s*hidden/);
		expect(layoutCss).not.toContain('.shell-root.is-frozen');
	});
});
