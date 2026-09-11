const MAX_FINISH_MS = 120;
const WHEEL_QUIET_MS = 48;

/** Shorten only the slow end of native snapping, retaining native drag and fling travel. */
export function createWeekPagerSnap(node: HTMLElement, onSettled: () => void) {
	const listeners = new AbortController();
	const options = { passive: true, capture: true, signal: listeners.signal };
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let pointerDown = false;
	let touching = false;
	let wheelActiveUntil = 0;
	let lastOffset = node.scrollLeft;
	let lastTime = performance.now();
	let lastVelocity = 0;
	let animation: { frame: number; restore: () => void } | null = null;

	function cancel() {
		if (animation) {
			cancelAnimationFrame(animation.frame);
			animation.restore();
			animation = null;
		}
		lastOffset = node.scrollLeft;
		lastTime = performance.now();
		lastVelocity = 0;
	}

	function finishSnap(target: number, velocity: number, now: number) {
		const from = node.scrollLeft;
		const distance = target - from;
		const width = node.clientWidth;
		const scrollWidth = node.scrollWidth;
		const duration = (4 * Math.abs(distance / velocity)) / 3;
		// Clamping the duration would force a second acceleration toward the page.
		// Wait until the remaining distance fits a short, velocity-matched deceleration.
		if (duration > MAX_FINISH_MS) return;
		const { scrollSnapType, overflowX } = node.style;
		const running = {
			frame: 0,
			restore() {
				node.style.scrollSnapType = scrollSnapType;
				node.style.overflowX = overflowX;
			}
		};
		animation = running;
		// Disable native snapping and stop iOS momentum before driving the short finish.
		node.style.scrollSnapType = 'none';
		node.style.overflowX = 'hidden';
		node.scrollTo({ left: from, behavior: 'instant' });

		function step(time: number) {
			if (animation !== running) return;
			if (node.clientWidth !== width || node.scrollWidth !== scrollWidth) {
				cancel();
				return;
			}
			const t = Math.min(1, Math.max(0, (time - now) / duration));
			// Integrate v(t) = v0 * (1 - t³): keep the incoming speed, then only brake.
			const left = from + (distance * (4 * t - t ** 4)) / 3;
			node.scrollTo({ left, behavior: 'instant' });
			running.frame = requestAnimationFrame(
				t < 1
					? step
					: () => {
							// Let the final scroll event update the week and indicator before settling.
							cancel();
							onSettled();
						}
			);
		}
		running.frame = requestAnimationFrame(step);
	}

	function onScroll() {
		if (animation) return;
		const now = performance.now();
		const offset = node.scrollLeft;
		const elapsed = now - lastTime;
		const previousVelocity = lastVelocity;
		const velocity = elapsed > 0 && elapsed <= 80 ? (offset - lastOffset) / elapsed : 0;
		lastOffset = offset;
		lastTime = now;
		lastVelocity = velocity;
		if (pointerDown || touching || now < wheelActiveUntil || reducedMotion.matches) return;

		const width = node.clientWidth;
		const maxOffset = node.scrollWidth - width;
		if (width <= 0 || offset < 0 || offset > maxOffset) return;
		const target = Math.max(0, Math.min(maxOffset, Math.round(offset / width) * width));
		const distance = target - offset;
		if (
			Math.abs(distance) < 1 ||
			Math.abs(distance) > width * 0.12 ||
			velocity * distance <= 0 ||
			velocity * previousVelocity <= 0 ||
			Math.abs(velocity) > Math.abs(previousVelocity) ||
			Math.abs(velocity) >= width / 500
		) {
			return;
		}
		finishSnap(target, velocity, now);
	}

	node.addEventListener('scroll', onScroll, options);
	node.addEventListener('keydown', cancel, options);
	node.addEventListener(
		'pointerdown',
		() => {
			pointerDown = true;
			cancel();
		},
		options
	);
	const releasePointer = () => {
		pointerDown = false;
	};
	node.ownerDocument.addEventListener('pointerup', releasePointer, options);
	node.ownerDocument.addEventListener('pointercancel', releasePointer, options);
	node.addEventListener(
		'touchstart',
		() => {
			touching = true;
			cancel();
		},
		options
	);
	const releaseTouch = (event: TouchEvent) => {
		touching = event.touches.length > 0;
	};
	node.addEventListener('touchend', releaseTouch, options);
	node.addEventListener('touchcancel', releaseTouch, options);
	node.addEventListener(
		'wheel',
		() => {
			wheelActiveUntil = performance.now() + WHEEL_QUIET_MS;
			cancel();
		},
		options
	);

	return {
		get isAnimating() {
			return animation !== null;
		},
		cancel,
		destroy() {
			listeners.abort();
			cancel();
		}
	};
}
