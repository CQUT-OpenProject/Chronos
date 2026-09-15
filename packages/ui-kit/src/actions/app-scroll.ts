import { scrollRevealScrollbar } from './scroll-reveal-scrollbar';
import { scrollRubberBand } from './scroll-rubber-band';

export type AppScrollOptions = {
	rubberBand?: boolean;
};

/** Reveals a thin scrollbar while scrolling and optionally adds touch overscroll rubber-band feedback. */
export function appScroll(node: HTMLElement, options: AppScrollOptions = {}) {
	const scrollbar = scrollRevealScrollbar(node);
	const rubberBand = scrollRubberBand(node, options.rubberBand ?? true);
	return {
		destroy() {
			scrollbar.destroy();
			rubberBand.destroy();
		}
	};
}
