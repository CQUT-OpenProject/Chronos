import { describe, expect, it } from 'vite-plus/test';
import {
	cutBoundaryIndices,
	fitFontSizePx,
	fitsWrappedBlock,
	toGraphemes,
	truncateMiddleByFit,
	wrappedLineCount
} from '../src/utils/middle-truncate';
/** Every grapheme is width 10; ellipsis is also one unit. */
const unitMeasure = (text: string) => toGraphemes(text).length * 10;

describe('middle-truncate', () => {
	it('fitFontSizePx scales down until text fits', () => {
		// Width grows linearly with font size: "非本周" (3) * fontSize
		const measureAt = (fontSizePx: number) => 3 * fontSizePx;
		expect(fitFontSizePx(36, measureAt, 12, 6)).toBe(12);
		const fitted = fitFontSizePx(24, measureAt, 12, 6);
		expect(fitted).toBeLessThanOrEqual(8);
		expect(measureAt(fitted)).toBeLessThanOrEqual(24);
		expect(fitFontSizePx(10, measureAt, 12, 6)).toBe(6);
	});

	it('punctuation creates snap cut boundaries', () => {
		const title = '毛泽东思想：概论';
		const graphemes = toGraphemes(title);
		const boundaries = cutBoundaryIndices(title, graphemes);
		const colonAt = graphemes.findIndex((g) => g === '：');
		expect(colonAt).toBeGreaterThan(0);
		expect(boundaries).toContain(colonAt);
		expect(boundaries).toContain(colonAt + 1);
	});

	it('truncateMiddleByFit binary-searches against a fits predicate', () => {
		const text = 'ABCDEFGHIJKL';
		// Capacity: 7 grapheme-units including ellipsis → retain 6 → ABC…JKL
		const result = truncateMiddleByFit(text, (candidate) => unitMeasure(candidate) <= 70);
		expect(result).toBe('ABC…JKL');
	});

	it('wrappedLineCount packs graphemes with break-all wrapping', () => {
		expect(wrappedLineCount('', 50, unitMeasure)).toBe(0);
		expect(wrappedLineCount('ABCDE', 50, unitMeasure)).toBe(1);
		expect(wrappedLineCount('ABCDEF', 50, unitMeasure)).toBe(2);
		expect(wrappedLineCount('ABCDEFGHIJ', 50, unitMeasure)).toBe(2);
		expect(wrappedLineCount('ABCDEFGHIJK', 50, unitMeasure)).toBe(3);
	});

	it('fitsWrappedBlock compares wrapped height against the box', () => {
		const box = { maxWidth: 50, lineHeight: 12, measure: unitMeasure };
		expect(fitsWrappedBlock('ABCDE', { ...box, maxHeight: 12 })).toBe(true);
		expect(fitsWrappedBlock('ABCDEF', { ...box, maxHeight: 12 })).toBe(false);
		expect(fitsWrappedBlock('ABCDEF', { ...box, maxHeight: 24 })).toBe(true);
		expect(fitsWrappedBlock('A', { ...box, maxWidth: 0, maxHeight: 12 })).toBe(false);
	});

	it('truncateMiddleByFit keeps prefix and suffix when wrapping two lines', () => {
		const text = 'ABCDEFGHIJKL';
		const result = truncateMiddleByFit(text, (candidate) =>
			fitsWrappedBlock(candidate, {
				maxWidth: 50,
				maxHeight: 24,
				lineHeight: 12,
				measure: unitMeasure
			})
		);
		expect(result).toBe('ABCDE…IJKL');
		expect(wrappedLineCount(result, 50, unitMeasure)).toBe(2);
	});
});
