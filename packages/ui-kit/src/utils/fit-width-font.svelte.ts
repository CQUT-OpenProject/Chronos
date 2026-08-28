import type { Attachment } from 'svelte/attachments';
import { createSizedCanvasMeasurer, fitFontSizePx } from './middle-truncate';

export type FitWidthFontParams = {
	lines: string[];
	maxFontPx: number;
	minFontPx?: number;
	fromParent?: boolean;
};

const DEFAULT_MIN_FONT_PX = 6;

/**
 * Pass a getter so `{@attach createFitWidthFontAttachment(() => …)}` does not
 * re-create the attachment when params change — inner `$effect` applies updates.
 */
export function createFitWidthFontAttachment(
	getParams: () => FitWidthFontParams
): Attachment<HTMLElement> {
	return (node) => {
		const apply = () => {
			const { lines, maxFontPx, minFontPx = DEFAULT_MIN_FONT_PX, fromParent = false } = getParams();
			const contents = lines.filter((line) => line.length > 0);
			const box = fromParent ? (node.parentElement ?? node) : node;
			let available = box.clientWidth;
			if (fromParent) {
				const style = getComputedStyle(node);
				available -=
					(Number.parseFloat(style.paddingLeft) || 0) +
					(Number.parseFloat(style.paddingRight) || 0);
				available = Math.max(0, available);
			}
			if (available <= 0 || contents.length === 0) return;

			const measurerForSize = createSizedCanvasMeasurer(node);
			const fontPx = fitFontSizePx(
				available,
				(size) => {
					const measure = measurerForSize(size);
					return Math.max(...contents.map((line) => measure(line)));
				},
				maxFontPx,
				minFontPx
			);
			node.style.fontSize = `${fontPx}px`;
		};

		let observed: Element | null = null;
		const observer = new ResizeObserver(apply);

		$effect(() => {
			const { fromParent = false } = getParams();
			const target = fromParent ? (node.parentElement ?? node) : node;
			if (observed !== target) {
				observer.disconnect();
				observer.observe(target);
				observed = target;
			}
			apply();
		});

		return () => observer.disconnect();
	};
}
