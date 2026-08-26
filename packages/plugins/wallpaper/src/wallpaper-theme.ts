import { argbFromRgb, QuantizerCelebi, Score } from '@ktibow/material-color-utilities-nightly';
import type { CoursePaletteEntry, DynamicColorAdapter } from '@chronos/core';
import { coursePaletteFromSources, schemeAccentCssVars } from '@chronos/ui-kit';

const MAX_EDGE = 128;

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

/**
 * Creates an isolated dynamic-color adapter. All mutable state (applied CSS
 * keys, seed cache) lives in the closure so concurrent plugin instances never
 * share state across load/unload cycles — same isolation contract as
 * `createWallpaperRuntime` (ADR 0016 §3).
 */
export function createWallpaperThemeAdapter(): DynamicColorAdapter {
	let appliedKeys: string[] = [];
	let cachedUri: string | null = null;
	let cachedSeed: number | null = null;
	let cachedRanked: number[] | null = null;

	function resolveTarget(target?: HTMLElement): HTMLElement | undefined {
		return target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
	}

	function clear(target?: HTMLElement): void {
		const el = resolveTarget(target);
		if (!el) return;
		for (const key of appliedKeys) {
			el.style.removeProperty(key);
		}
		appliedKeys = [];
	}

	async function extractSeed(
		uri: string
	): Promise<{ seed: number; coursePalette: readonly CoursePaletteEntry[] }> {
		if (uri !== cachedUri || cachedSeed == null || cachedRanked == null) {
			const { seed, ranked } = colorsFromImageBytes(await downsampleImageBytes(uri));
			cachedUri = uri;
			cachedSeed = seed;
			cachedRanked = ranked;
		}
		return { seed: cachedSeed, coursePalette: coursePaletteFromSources(cachedRanked) };
	}

	function paint(seed: number, isDark: boolean, target?: HTMLElement): void {
		const el = resolveTarget(target);
		if (!el) return;
		const vars = schemeAccentCssVars(seed, isDark);
		clear(el);
		appliedKeys = Object.keys(vars);
		for (const [key, value] of Object.entries(vars)) {
			el.style.setProperty(key, value);
		}
	}

	return {
		extractWallpaperSeed: extractSeed,
		paintWallpaperTheme: paint,
		clearWallpaperTheme: clear
	};
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
