import { describe, expect, it } from 'vite-plus/test';
import {
	BRAND_SOURCE_ARGB,
	coursePaletteFromSource,
	coursePaletteFromSources,
	schemeAccentCssVars
} from './scheme';

const HEX = /^#([\da-f]{3}|[\da-f]{6})$/i;

describe('coursePaletteFromSource', () => {
	it('builds 6 hex course colors from a source', () => {
		const palette = coursePaletteFromSource(BRAND_SOURCE_ARGB);
		expect(palette).toHaveLength(6);
		for (const entry of palette) {
			expect(entry.background).toMatch(HEX);
			expect(entry.foreground).toMatch(HEX);
		}
	});
});

describe('coursePaletteFromSources', () => {
	it('pads a single source to 6 entries', () => {
		const palette = coursePaletteFromSources([BRAND_SOURCE_ARGB]);
		expect(palette).toHaveLength(6);
		for (const entry of palette) {
			expect(entry.background).toMatch(HEX);
			expect(entry.foreground).toMatch(HEX);
		}
	});

	it('keeps 6 unique backgrounds from 6 source hues', () => {
		const sources = [0xffff0000, 0xff00ff00, 0xff0000ff, 0xffffff00, 0xffff00ff, 0xff00ffff];
		const palette = coursePaletteFromSources(sources);
		expect(palette).toHaveLength(6);
		expect(new Set(palette.map((entry) => entry.background)).size).toBe(6);
	});
});

describe('schemeAccentCssVars', () => {
	it('sets brand tokens and skips surface', () => {
		const vars = schemeAccentCssVars(BRAND_SOURCE_ARGB, false);
		expect(vars['--color-primary']).toMatch(HEX);
		expect(vars['--color-brand']).toBe(vars['--color-primary']);
		expect(vars['--color-surface']).toBeUndefined();
	});
});
