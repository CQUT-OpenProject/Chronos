import { scrollRevealScrollbar } from './scroll-reveal-scrollbar';
import { scrollRubberBand } from './scroll-rubber-band';

/** Scrollbar reveal for general in-app scroll regions (no rubber-band). */
export function appScroll(node: HTMLElement) {
	return scrollRevealScrollbar(node);
}

/** Primary screen scroll: scrollbar reveal + touch rubber-band. */
export function appShellScroll(node: HTMLElement) {
	const scrollbar = scrollRevealScrollbar(node);
	const rubberBand = scrollRubberBand(node);
	return {
		destroy() {
			scrollbar.destroy();
			rubberBand.destroy();
		}
	};
}
