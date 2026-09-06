/** Coalesces rapid updates into a single animation-frame callback. */
export function createRafCoalescer<T>(onFlush: (value: T) => void) {
	let pending: T | null = null;
	let rafHandle: number | null = null;

	const requestFrame =
		typeof requestAnimationFrame === 'function'
			? requestAnimationFrame
			: (cb: FrameRequestCallback) => setTimeout(cb, 0) as unknown as number;

	const cancelFrame =
		typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;

	function schedule(value: T): void {
		pending = value;
		if (rafHandle == null) {
			rafHandle = requestFrame(() => {
				rafHandle = null;
				if (pending != null) {
					const target = pending;
					pending = null;
					onFlush(target);
				}
			});
		}
	}

	function flush(value: T): void {
		cancel();
		onFlush(value);
	}

	function cancel(): void {
		if (rafHandle != null) {
			cancelFrame(rafHandle);
			rafHandle = null;
		}
		pending = null;
	}

	return { schedule, flush, cancel };
}
