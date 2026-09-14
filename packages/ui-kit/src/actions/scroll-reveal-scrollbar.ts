const HIDE_DELAY_MS = 900;

/** Reveals a thin scrollbar while the element is scrolling, then hides it again. */
export function scrollRevealScrollbar(node: HTMLElement) {
	let hideTimer: ReturnType<typeof setTimeout> | undefined;

	const reveal = () => {
		node.classList.add('is-scrolling');
		if (hideTimer !== undefined) clearTimeout(hideTimer);
		hideTimer = setTimeout(() => {
			node.classList.remove('is-scrolling');
			hideTimer = undefined;
		}, HIDE_DELAY_MS);
	};

	node.addEventListener('scroll', reveal, { passive: true });

	return {
		destroy() {
			node.removeEventListener('scroll', reveal);
			if (hideTimer !== undefined) clearTimeout(hideTimer);
			node.classList.remove('is-scrolling');
		}
	};
}
