export type MeasureFn = (text: string) => number;

const DEFAULT_ELLIPSIS = '…';

const PUNCT_CUT = /[\s《》「」『』【】（）()·—\-、，,：:；;！!？?.…]/u;

let graphemeSegmenter: Intl.Segmenter | null | undefined;
let wordSegmenter: Intl.Segmenter | null | undefined;

export function toGraphemes(text: string): string[] {
	if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
		graphemeSegmenter ??= new Intl.Segmenter('und', { granularity: 'grapheme' });
		return [...graphemeSegmenter.segment(text)].map((part) => part.segment);
	}
	return Array.from(text);
}

function getWordSegmenter(): Intl.Segmenter | null {
	if (typeof Intl === 'undefined' || typeof Intl.Segmenter !== 'function') return null;
	wordSegmenter ??= new Intl.Segmenter('zh-CN', { granularity: 'word' });
	return wordSegmenter;
}

/**
 * Grapheme indices that are valid middle-ellipsis cut points (includes 0 and length).
 * Uses Intl word boundaries when available, plus whitespace/punctuation.
 */
export function cutBoundaryIndices(text: string, graphemes: string[]): number[] {
	const length = graphemes.length;
	const boundaries = new Set<number>([0, length]);

	const segmenter = getWordSegmenter();
	if (segmenter) {
		for (const part of segmenter.segment(text)) {
			if (!part.isWordLike) continue;
			const start = toGraphemes(text.slice(0, part.index)).length;
			boundaries.add(start);
			boundaries.add(start + toGraphemes(part.segment).length);
		}
	}

	for (let index = 1; index < length; index += 1) {
		const left = graphemes[index - 1] ?? '';
		const right = graphemes[index] ?? '';
		if (PUNCT_CUT.test(left) || PUNCT_CUT.test(right)) {
			boundaries.add(index);
		}
	}

	return [...boundaries].sort((left, right) => left - right);
}

/**
 * Snap raw prefix/suffix lengths inward onto cut boundaries (may retain fewer graphemes).
 */
export function snapMiddleLengths(
	graphemes: string[],
	retained: number,
	boundaries?: number[]
): { prefixLength: number; suffixLength: number } {
	if (retained <= 0) return { prefixLength: 0, suffixLength: 0 };
	if (retained >= graphemes.length) {
		return { prefixLength: graphemes.length, suffixLength: 0 };
	}

	const rawPrefix = Math.ceil(retained / 2);
	const rawSuffix = Math.floor(retained / 2);
	const cuts = boundaries ?? cutBoundaryIndices(graphemes.join(''), graphemes);

	// Snap inward, but never collapse a non-empty side to empty (Latin / single-token titles).
	let prefixLength = rawPrefix;
	const prefixCut = largestAtMost(cuts, rawPrefix);
	if (prefixCut != null && !(prefixCut === 0 && rawPrefix > 0)) {
		prefixLength = prefixCut;
	}

	let suffixLength = rawSuffix;
	const suffixStart = graphemes.length - rawSuffix;
	const snappedStart = smallestAtLeast(cuts, suffixStart);
	if (snappedStart != null && snappedStart < graphemes.length) {
		suffixLength = graphemes.length - snappedStart;
	}

	return { prefixLength, suffixLength };
}

function largestAtMost(sorted: number[], value: number): number | null {
	let best: number | null = null;
	for (const item of sorted) {
		if (item > value) break;
		best = item;
	}
	return best;
}

function smallestAtLeast(sorted: number[], value: number): number | null {
	for (const item of sorted) {
		if (item >= value) return item;
	}
	return null;
}

export function buildMiddleCandidate(
	graphemes: string[],
	retained: number,
	ellipsis: string,
	boundaries?: number[]
): string {
	if (retained <= 0) return ellipsis;
	if (retained >= graphemes.length) return graphemes.join('');

	const { prefixLength, suffixLength } = snapMiddleLengths(graphemes, retained, boundaries);
	if (prefixLength <= 0 && suffixLength <= 0) return ellipsis;

	const prefix = graphemes.slice(0, prefixLength).join('');
	const suffix = suffixLength > 0 ? graphemes.slice(graphemes.length - suffixLength).join('') : '';
	return `${prefix}${ellipsis}${suffix}`;
}

/**
 * Binary-search middle truncation against a DOM/layout `fits` predicate.
 * Used when canvas line estimates disagree with CSS wrapping.
 */
export function truncateMiddleByFit(
	text: string,
	fits: (candidate: string) => boolean,
	ellipsis = DEFAULT_ELLIPSIS
): string {
	if (!text) return text;
	if (fits(text)) return text;
	if (!fits(ellipsis)) return '';

	const graphemes = toGraphemes(text);
	const boundaries = cutBoundaryIndices(text, graphemes);
	let best = ellipsis;
	let low = 0;
	let high = graphemes.length;

	while (low <= high) {
		const retained = Math.floor((low + high) / 2);
		const candidate = buildMiddleCandidate(graphemes, retained, ellipsis, boundaries);
		if (fits(candidate)) {
			best = candidate;
			low = retained + 1;
		} else {
			high = retained - 1;
		}
	}

	return best;
}

let sharedCanvas: HTMLCanvasElement | null = null;

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
	const measuredHi = measureAt(hi);
	if (measuredHi <= maxWidth) return hi;

	const ideal = (maxWidth / measuredHi) * hi;
	let fitted = Math.max(lo, Math.min(hi, Math.floor(ideal * 10) / 10));
	if (fitted <= lo) return lo;

	if (measureAt(fitted) > maxWidth) {
		const measuredFitted = measureAt(fitted);
		if (measuredFitted > maxWidth) {
			const refined = (maxWidth / measuredFitted) * fitted;
			fitted = Math.max(lo, Math.min(hi, Math.floor(refined * 10) / 10));
		}
	}
	return fitted;
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
