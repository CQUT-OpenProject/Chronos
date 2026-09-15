import { isReducedMotionActive } from '../motion/motion';

const MAX_PULL_PX = 120;
const SPRING_MS = 220;
const SPRING_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

/** Maps finger travel to a damped visual offset for rubber-band overscroll. */
export function dampenOverscroll(delta: number, maxPull = MAX_PULL_PX): number {
	if (delta === 0) return 0;
	const sign = Math.sign(delta);
	const abs = Math.abs(delta);
	const damped = maxPull * (1 - Math.exp(-abs / maxPull));
	return sign * damped;
}

function isAtTop(node: HTMLElement): boolean {
	return node.scrollTop <= 0;
}

function getMaxScroll(node: HTMLElement): number {
	return Math.max(0, node.scrollHeight - node.clientHeight);
}

function isAtBottom(node: HTMLElement): boolean {
	const maxScroll = getMaxScroll(node);
	return maxScroll <= 0 || node.scrollTop >= maxScroll - 1;
}

/** Advances rubber-band pull only after native scroll has stopped at a boundary. */
export function computeNextPullOffset(
	pullOffset: number,
	dy: number,
	atTop: boolean,
	atBottom: boolean,
	scrollMoved: boolean
): number {
	if (scrollMoved) return 0;

	if (pullOffset !== 0) {
		let next = pullOffset + dy;
		if (next > 0 && !atTop) next = 0;
		if (next < 0 && !atBottom) next = 0;
		return next;
	}

	if (atTop && dy > 0) return dy;
	if (atBottom && dy < 0) return dy;
	return 0;
}

function canUseRubberBand(): boolean {
	return typeof window !== 'undefined' && !isReducedMotionActive();
}

function attachRubberBand(node: HTMLElement) {
	let lastY = 0;
	let lastScrollTop = 0;
	let pullOffset = 0;
	let springTimer: ReturnType<typeof setTimeout> | undefined;

	const clearSpring = () => {
		if (springTimer !== undefined) {
			clearTimeout(springTimer);
			springTimer = undefined;
		}
		node.style.transition = '';
	};

	const resetTransform = (animate: boolean) => {
		clearSpring();
		if (!animate) {
			node.style.transform = '';
			return;
		}

		node.style.transition = `transform ${SPRING_MS}ms ${SPRING_EASING}`;
		node.style.transform = '';
		springTimer = setTimeout(() => {
			node.style.transition = '';
			springTimer = undefined;
		}, SPRING_MS + 32);
	};

	const applyPull = () => {
		const visual = dampenOverscroll(pullOffset);
		node.style.transform = visual === 0 ? '' : `translate3d(0, ${visual}px, 0)`;
	};

	const onTouchStart = (event: TouchEvent) => {
		if (event.touches.length !== 1) return;
		clearSpring();
		lastY = event.touches[0].clientY;
		lastScrollTop = node.scrollTop;
		pullOffset = 0;
	};

	const onTouchMove = (event: TouchEvent) => {
		if (event.touches.length !== 1) return;
		const y = event.touches[0].clientY;
		const dy = y - lastY;
		lastY = y;

		const scrollTop = node.scrollTop;
		const scrollMoved = scrollTop !== lastScrollTop;
		lastScrollTop = scrollTop;

		const nextPullOffset = computeNextPullOffset(
			pullOffset,
			dy,
			isAtTop(node),
			isAtBottom(node),
			scrollMoved
		);

		if (nextPullOffset === pullOffset && nextPullOffset === 0) return;

		pullOffset = nextPullOffset;

		if (pullOffset === 0) {
			node.style.transform = '';
			return;
		}

		applyPull();
	};

	const onTouchEnd = () => {
		if (pullOffset === 0) return;
		pullOffset = 0;
		resetTransform(true);
	};

	node.addEventListener('touchstart', onTouchStart, { passive: true });
	node.addEventListener('touchmove', onTouchMove, { passive: true });
	node.addEventListener('touchend', onTouchEnd, { passive: true });
	node.addEventListener('touchcancel', onTouchEnd, { passive: true });

	return {
		destroy() {
			node.removeEventListener('touchstart', onTouchStart);
			node.removeEventListener('touchmove', onTouchMove);
			node.removeEventListener('touchend', onTouchEnd);
			node.removeEventListener('touchcancel', onTouchEnd);
			clearSpring();
			node.style.transform = '';
		}
	};
}

/** Adds touch overscroll rubber-band feedback on a vertical scroll container. */
export function scrollRubberBand(node: HTMLElement, enabled: boolean = true) {
	let active: ReturnType<typeof attachRubberBand> | null = null;

	const setEnabled = (next: boolean) => {
		if (next && canUseRubberBand()) {
			if (!active) active = attachRubberBand(node);
			return;
		}
		active?.destroy();
		active = null;
	};

	setEnabled(enabled);

	return {
		update(nextEnabled: boolean) {
			setEnabled(nextEnabled);
		},
		destroy() {
			active?.destroy();
			active = null;
		}
	};
}
