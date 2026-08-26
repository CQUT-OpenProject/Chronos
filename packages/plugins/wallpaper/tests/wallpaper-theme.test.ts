import { argbFromHex, Hct } from '@ktibow/material-color-utilities-nightly';
import { describe, expect, it } from 'vite-plus/test';
import { colorsFromImageBytes } from '../src/wallpaper-theme';
import { coursePaletteFromSources } from '@chronos/ui-kit';
import type { CoursePaletteEntry } from '@chronos/core';

const RED = 0xffff0000;
const BLUE = 0xff0000ff;
const RED_HUE = Hct.fromInt(RED).hue;
const BLUE_HUE = Hct.fromInt(BLUE).hue;

function hueDistance(a: number, b: number) {
	const delta = Math.abs(a - b) % 360;
	return Math.min(delta, 360 - delta);
}

function twoColorRgba(width: number, height: number) {
	const bytes = new Uint8ClampedArray(width * height * 4);
	const mid = width / 2;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			const isLeft = x < mid;
			bytes[i] = isLeft ? 255 : 0;
			bytes[i + 1] = 0;
			bytes[i + 2] = isLeft ? 0 : 255;
			bytes[i + 3] = 255;
		}
	}
	return bytes;
}

describe('colorsFromImageBytes', () => {
	it('ranks red and blue into a 6-entry multi-hue course palette', () => {
		const { seed, ranked } = colorsFromImageBytes(twoColorRgba(16, 16));
		const seedHue = Hct.fromInt(seed).hue;
		expect(Math.min(hueDistance(seedHue, RED_HUE), hueDistance(seedHue, BLUE_HUE))).toBeLessThan(
			15
		);

		const palette: CoursePaletteEntry[] = coursePaletteFromSources(ranked);
		expect(palette).toHaveLength(6);

		const hues = palette.map(
			(entry: CoursePaletteEntry) => Hct.fromInt(argbFromHex(entry.background)).hue
		);
		expect(hues.some((hue: number) => hueDistance(hue, RED_HUE) < 20)).toBe(true);
		expect(hues.some((hue: number) => hueDistance(hue, BLUE_HUE) < 20)).toBe(true);
	});
});
