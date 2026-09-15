import { scrollRevealScrollbar } from './scroll-reveal-scrollbar';
import { scrollRubberBand } from './scroll-rubber-band';

/** Reveals a thin scrollbar while scrolling and adds touch overscroll rubber-band feedback. */
export function appScroll(node: HTMLElement) {
	const scrollbar = scrollRevealScrollbar(node);
	const rubberBand = scrollRubberBand(node);
	return {
		destroy() {
			scrollbar.destroy();
			rubberBand.destroy();
		}
	};
}
