/** Returns a callback that invokes fn at most once per intervalMs. */
export function createThrottledCallback(fn: () => void, intervalMs: number): () => void {
	let lastTime = -Infinity;
	return () => {
		const now = Date.now();
		if (now - lastTime >= intervalMs) {
			lastTime = now;
			fn();
		}
	};
}
