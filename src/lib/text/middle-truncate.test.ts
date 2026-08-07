import { describe, expect, it } from 'vite-plus/test';
import {
	fitFontSizePx,
	fitsMultiline,
	toGraphemes,
	truncateMiddle,
	truncateMiddleMultiline
} from './middle-truncate';

/** Every grapheme is width 10; ellipsis is also one unit. */
const unitMeasure = (text: string) => toGraphemes(text).length * 10;

describe('middle-truncate', () => {
	it('returns empty text unchanged', () => {
		expect(truncateMiddle('', 100, unitMeasure)).toBe('');
		expect(truncateMiddleMultiline('', 100, 2, unitMeasure)).toBe('');
	});

	it('returns original when it already fits on one line', () => {
		expect(truncateMiddle('短名', 100, unitMeasure)).toBe('短名');
	});

	it('returns empty when maxWidth is non-positive', () => {
		expect(truncateMiddle('课程', 0, unitMeasure)).toBe('');
		expect(truncateMiddleMultiline('课程', 0, 2, unitMeasure)).toBe('');
		expect(truncateMiddleMultiline('课程', 100, 0, unitMeasure)).toBe('');
	});

	it('middle-truncates a single line with balanced sides', () => {
		// 10 graphemes → width 100; maxWidth 70 → keep 6 + ellipsis = 7 units = 70
		const result = truncateMiddle('ABCDEFGHIJ', 70, unitMeasure);
		expect(result).toContain('…');
		expect(result.startsWith('A')).toBe(true);
		expect(result.endsWith('J')).toBe(true);
		expect(unitMeasure(result)).toBeLessThanOrEqual(70);
		// Retained 6 → prefix 3 + suffix 3 → ABC…HIJ
		expect(result).toBe('ABC…HIJ');
	});

	it('falls back to ellipsis-only when extremely narrow', () => {
		expect(truncateMiddle('ABCDEFGHIJ', 10, unitMeasure)).toBe('…');
	});

	it('fitsMultiline counts grapheme-greedy wraps', () => {
		// 6 graphemes, width 30 → 3 per line → needs 2 lines
		expect(fitsMultiline('ABCDEF', 30, 2, unitMeasure)).toBe(true);
		expect(fitsMultiline('ABCDEF', 30, 1, unitMeasure)).toBe(false);
	});

	it('multiline middle-truncates to fit maxLines', () => {
		// 12 graphemes; maxWidth 40 (4/line), maxLines 2 → capacity 8 units including ellipsis
		const result = truncateMiddleMultiline('ABCDEFGHIJKL', 40, 2, unitMeasure);
		expect(result).toContain('…');
		expect(fitsMultiline(result, 40, 2, unitMeasure)).toBe(true);
		expect(result.startsWith('A')).toBe(true);
		expect(result.endsWith('L')).toBe(true);
	});

	it('returns original when multiline already fits', () => {
		expect(truncateMiddleMultiline('ABCD', 40, 2, unitMeasure)).toBe('ABCD');
	});

	it('fitFontSizePx scales down until text fits', () => {
		// Width grows linearly with font size: "非本周" (3) * fontSize
		const measureAt = (fontSizePx: number) => 3 * fontSizePx;
		expect(fitFontSizePx(36, measureAt, 12, 6)).toBe(12);
		const fitted = fitFontSizePx(24, measureAt, 12, 6);
		expect(fitted).toBeLessThanOrEqual(8);
		expect(measureAt(fitted)).toBeLessThanOrEqual(24);
		expect(fitFontSizePx(10, measureAt, 12, 6)).toBe(6);
	});
});
