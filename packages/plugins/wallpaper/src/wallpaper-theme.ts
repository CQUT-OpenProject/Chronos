import { argbFromRgb, QuantizerCelebi, Score } from '@ktibow/material-color-utilities-nightly';
import type { CoursePaletteEntry } from '@chronos/core';
import { coursePaletteFromSources, schemeAccentCssVars } from '@chronos/ui-kit';

const MAX_EDGE = 128;

let appliedKeys: string[] = [];
let cachedUri: string | null = null;
let cachedSeed: number | null = null;
let cachedRanked: number[] | null = null;

export function colorsFromImageBytes(bytes: Uint8ClampedArray): {
	seed: number;
	ranked: number[];
} {
	const pixels: number[] = [];
	for (let i = 0; i < bytes.length; i += 4) {
		const r = bytes[i];
		const g = bytes[i + 1];
		const b = bytes[i + 2];
		const a = bytes[i + 3];
		if (a < 255) continue;
		pixels.push(argbFromRgb(r, g, b));
	}
	const ranked = Score.score(QuantizerCelebi.quantize(pixels, 128), { desired: 6 });
	return { seed: ranked[0], ranked };
}

export function clearWallpaperTheme(target?: HTMLElement) {
	const el = target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
	if (!el) return;
	for (const key of appliedKeys) {
		el.style.removeProperty(key);
	}
	appliedKeys = [];
}

export async function extractWallpaperSeed(uri: string): Promise<{
	seed: number;
	coursePalette: CoursePaletteEntry[];
}> {
	if (uri !== cachedUri || cachedSeed == null || cachedRanked == null) {
		const { seed, ranked } = colorsFromImageBytes(await downsampleImageBytes(uri));
		cachedUri = uri;
		cachedSeed = seed;
		cachedRanked = ranked;
	}
	return { seed: cachedSeed, coursePalette: coursePaletteFromSources(cachedRanked) };
}

export function paintWallpaperTheme(seed: number, isDark: boolean, target?: HTMLElement) {
	const el = target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
	if (!el) return;
	const vars = schemeAccentCssVars(seed, isDark);
	clearWallpaperTheme(el);
	appliedKeys = Object.keys(vars);
	for (const [key, value] of Object.entries(vars)) {
		el.style.setProperty(key, value);
	}
}

async function downsampleImageBytes(uri: string): Promise<Uint8ClampedArray> {
	const image = new Image();
	image.src = uri;
	await image.decode();
	const naturalWidth = image.naturalWidth || image.width;
	const naturalHeight = image.naturalHeight || image.height;
	const scale = Math.min(1, MAX_EDGE / Math.max(naturalWidth, naturalHeight, 1));
	const width = Math.max(1, Math.round(naturalWidth * scale));
	const height = Math.max(1, Math.round(naturalHeight * scale));
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d');
	if (!context) throw new Error('Could not get canvas context');
	context.drawImage(image, 0, 0, width, height);
	return context.getImageData(0, 0, width, height).data;
}
