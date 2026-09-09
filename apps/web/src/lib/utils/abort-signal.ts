/**
 * Merges multiple AbortSignals into one that aborts when any source aborts.
 * Does not rely on AbortSignal.any for broader runtime compatibility.
 */
export function mergeAbortSignals(signals: AbortSignal[]): AbortSignal {
	const active = signals.filter(Boolean);
	if (active.length === 0) {
		throw new Error('mergeAbortSignals requires at least one signal');
	}
	if (active.length === 1) {
		return active[0]!;
	}

	const controller = new AbortController();
	for (const signal of active) {
		if (signal.aborted) {
			controller.abort(signal.reason);
			return controller.signal;
		}
		signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
	}
	return controller.signal;
}
