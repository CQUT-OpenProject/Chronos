export type CapsuleTransitionTimerKey = 'glassLinger' | 'expandedTrack';

/** Coalesces delayed indicator UI state changes behind named timers. */
export function createTransitionStateScheduler() {
	const timers = new Map<CapsuleTransitionTimerKey, ReturnType<typeof setTimeout>>();

	function cancel(key: CapsuleTransitionTimerKey): void {
		const timer = timers.get(key);
		if (timer == null) return;
		clearTimeout(timer);
		timers.delete(key);
	}

	function cancelAll(): void {
		for (const timer of timers.values()) {
			clearTimeout(timer);
		}
		timers.clear();
	}

	function hasPending(key: CapsuleTransitionTimerKey): boolean {
		return timers.has(key);
	}

	function scheduleTransitionState(
		key: CapsuleTransitionTimerKey,
		delayMs: number,
		onComplete: () => void
	): void {
		cancel(key);
		const timer = setTimeout(() => {
			timers.delete(key);
			onComplete();
		}, delayMs);
		timers.set(key, timer);
	}

	return { cancel, cancelAll, hasPending, scheduleTransitionState };
}
