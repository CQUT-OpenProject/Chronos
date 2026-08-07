export type MeasureFn = (text: string) => number;

const DEFAULT_ELLIPSIS = '…';

let graphemeSegmenter: Intl.Segmenter | null | undefined;

export function toGraphemes(text: string): string[] {
	if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
		graphemeSegmenter ??= new Intl.Segmenter('und', { granularity: 'grapheme' });
		return [...graphemeSegmenter.segment(text)].map((part) => part.segment);
	}
	return Array.from(text);
}

/**
 * Finder-style middle truncation for a single line.
 * Retains roughly equal grapheme counts on both sides of the ellipsis.
 */
export function truncateMiddle(
	text: string,
	maxWidth: number,
	measure: MeasureFn,
	ellipsis = DEFAULT_ELLIPSIS
): string {
	if (!text || maxWidth <= 0) {
		return maxWidth <= 0 ? '' : text;
	}
	if (measure(text) <= maxWidth) return text;

	const ellipsisWidth = measure(ellipsis);
	if (ellipsisWidth > maxWidth) return '';

	const graphemes = toGraphemes(text);
	let best = ellipsis;
	let low = 0;
	let high = graphemes.length;

	while (low <= high) {
		const retained = Math.floor((low + high) / 2);
		const candidate = buildMiddleCandidate(graphemes, retained, ellipsis);
		if (measure(candidate) <= maxWidth) {
			best = candidate;
			low = retained + 1;
		} else {
			high = retained - 1;
		}
	}

	return best;
}

/**
 * Middle truncation that must wrap into at most `maxLines` within `maxWidth`,
 * using grapheme-greedy line breaks (suitable for CJK course names).
 */
export function truncateMiddleMultiline(
	text: string,
	maxWidth: number,
	maxLines: number,
	measure: MeasureFn,
	ellipsis = DEFAULT_ELLIPSIS
): string {
	if (!text) return text;
	if (maxWidth <= 0 || maxLines <= 0) return '';
	if (fitsMultiline(text, maxWidth, maxLines, measure)) return text;

	const graphemes = toGraphemes(text);
	if (!fitsMultiline(ellipsis, maxWidth, maxLines, measure)) return '';

	let best = ellipsis;
	let low = 0;
	let high = graphemes.length;

	while (low <= high) {
		const retained = Math.floor((low + high) / 2);
		const candidate = buildMiddleCandidate(graphemes, retained, ellipsis);
		if (fitsMultiline(candidate, maxWidth, maxLines, measure)) {
			best = candidate;
			low = retained + 1;
		} else {
			high = retained - 1;
		}
	}

	return best;
}

export function fitsMultiline(
	text: string,
	maxWidth: number,
	maxLines: number,
	measure: MeasureFn
): boolean {
	if (maxLines <= 0 || maxWidth <= 0) return false;
	if (!text) return true;

	const graphemes = toGraphemes(text);
	let lines = 1;
	let lineStart = 0;

	for (let index = 0; index < graphemes.length; index += 1) {
		const line = graphemes.slice(lineStart, index + 1).join('');
		if (measure(line) <= maxWidth) continue;

		if (index === lineStart) {
			// Single grapheme wider than the line — still consumes a line.
			lines += 1;
			lineStart = index + 1;
		} else {
			lines += 1;
			lineStart = index;
			index -= 1;
		}

		if (lines > maxLines) return false;
	}

	return true;
}

function buildMiddleCandidate(graphemes: string[], retained: number, ellipsis: string): string {
	if (retained <= 0) return ellipsis;
	if (retained >= graphemes.length) return graphemes.join('');

	const prefixLength = Math.ceil(retained / 2);
	const suffixLength = Math.floor(retained / 2);
	const prefix = graphemes.slice(0, prefixLength).join('');
	const suffix = graphemes.slice(graphemes.length - suffixLength).join('');
	return `${prefix}${ellipsis}${suffix}`;
}

let sharedCanvas: HTMLCanvasElement | null = null;

/** Reads the canvas `font` shorthand from a live element. */
export function resolveFont(element: Element): string {
	const style = getComputedStyle(element);
	return (
		style.font ||
		`${style.fontStyle} ${style.fontWeight} ${style.fontSize} / ${style.lineHeight} ${style.fontFamily}`
	);
}

/** Offscreen canvas measurer — avoids layout thrashing while truncating. */
export function createCanvasMeasurer(font: string): MeasureFn {
	if (typeof document === 'undefined') {
		return () => Number.POSITIVE_INFINITY;
	}
	sharedCanvas ??= document.createElement('canvas');
	const context = sharedCanvas.getContext('2d');
	if (!context) return () => Number.POSITIVE_INFINITY;
	context.font = font;
	return (text: string) => context.measureText(text).width;
}

/**
 * Largest font size in `[minPx, maxPx]` whose measured text width fits `maxWidth`.
 * `measureAt(fontSizePx)` should return the rendered width at that size.
 */
export function fitFontSizePx(
	maxWidth: number,
	measureAt: (fontSizePx: number) => number,
	maxPx: number,
	minPx = 6
): number {
	if (maxWidth <= 0) return minPx;
	const hi = Math.max(minPx, maxPx);
	const lo = Math.min(minPx, hi);
	if (measureAt(hi) <= maxWidth) return hi;
	if (measureAt(lo) > maxWidth) return lo;

	let low = lo;
	let high = hi;
	let best = lo;
	for (let step = 0; step < 20; step += 1) {
		const mid = (low + high) / 2;
		if (measureAt(mid) <= maxWidth) {
			best = mid;
			low = mid;
		} else {
			high = mid;
		}
	}
	return Math.floor(best * 10) / 10;
}

/** Builds a size-parameterized measurer from an element's font family/weight/style. */
export function createSizedCanvasMeasurer(element: Element): (fontSizePx: number) => MeasureFn {
	const style = getComputedStyle(element);
	const fontStyle = style.fontStyle || 'normal';
	const fontWeight = style.fontWeight || 'normal';
	const fontFamily = style.fontFamily || 'sans-serif';
	return (fontSizePx: number) =>
		createCanvasMeasurer(`${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}`);
}
