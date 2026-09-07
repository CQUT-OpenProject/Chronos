import type { Attachment } from 'svelte/attachments';
import { createSizedCanvasMeasurer, fitFontSizePx } from './middle-truncate';

export type FitWidthFontParams = {
	lines: string[];
	maxFontPx: number;
	minFontPx?: number;
	fromParent?: boolean;
	availableWidthPx?: number;
};

const DEFAULT_MIN_FONT_PX = 6;
export const COURSE_CAPSULE_PAD_X_PX = 8;

export function courseCapsuleInnerWidthPx(columnWidthPx: number, widthPercent: number): number {
	return Math.max(0, (columnWidthPx * widthPercent) / 100 - COURSE_CAPSULE_PAD_X_PX * 2);
}

/**
 * Pass a getter so `{@attach createFitWidthFontAttachment(() => …)}` does not
 * re-create the attachment when params change — inner `$effect` applies updates.
 */
export function createFitWidthFontAttachment(
	getParams: () => FitWidthFontParams
): Attachment<HTMLElement> {
	return (node) => {
		const apply = () => {
			const {
				lines,
				maxFontPx,
				minFontPx = DEFAULT_MIN_FONT_PX,
				fromParent = false,
				availableWidthPx
			} = getParams();
			const contents = lines.filter((line) => line.length > 0);
			let available =
				availableWidthPx != null
					? availableWidthPx
					: (fromParent ? (node.parentElement ?? node) : node).clientWidth;
			if (fromParent) {
				const style = getComputedStyle(node);
				available -=
					(Number.parseFloat(style.paddingLeft) || 0) +
					(Number.parseFloat(style.paddingRight) || 0);
				if (node.parentElement) {
					const parentStyle = getComputedStyle(node.parentElement);
					available -=
						(Number.parseFloat(parentStyle.paddingLeft) || 0) +
						(Number.parseFloat(parentStyle.paddingRight) || 0);
				}
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
			const { fromParent = false, availableWidthPx } = getParams();
			if (availableWidthPx != null) {
				if (observed) {
					observer.disconnect();
					observed = null;
				}
				apply();
				return;
			}
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
