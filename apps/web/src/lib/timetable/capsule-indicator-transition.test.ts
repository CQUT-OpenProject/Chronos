import { describe, expect, it, vi } from 'vite-plus/test';
import { createTransitionStateScheduler } from '$lib/timetable/capsule-indicator-transition';

describe('createTransitionStateScheduler', () => {
	it('runs onComplete after the delay', () => {
		vi.useFakeTimers();
		const scheduler = createTransitionStateScheduler();
		const onComplete = vi.fn();

		scheduler.scheduleTransitionState('glassLinger', 1000, onComplete);
		expect(onComplete).not.toHaveBeenCalled();

		vi.advanceTimersByTime(999);
		expect(onComplete).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(onComplete).toHaveBeenCalledOnce();
		expect(scheduler.hasPending('glassLinger')).toBe(false);

		vi.useRealTimers();
	});

	it('replaces a pending timer for the same key', () => {
		vi.useFakeTimers();
		const scheduler = createTransitionStateScheduler();
		const first = vi.fn();
		const second = vi.fn();

		scheduler.scheduleTransitionState('expandedTrack', 200, first);
		scheduler.scheduleTransitionState('expandedTrack', 200, second);
		vi.runAllTimers();

		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledOnce();

		vi.useRealTimers();
	});

	it('cancel drops a pending timer without running onComplete', () => {
		vi.useFakeTimers();
		const scheduler = createTransitionStateScheduler();
		const onComplete = vi.fn();

		scheduler.scheduleTransitionState('glassLinger', 1000, onComplete);
		scheduler.cancel('glassLinger');
		vi.runAllTimers();

		expect(onComplete).not.toHaveBeenCalled();
		expect(scheduler.hasPending('glassLinger')).toBe(false);

		vi.useRealTimers();
	});

	it('cancelAll clears every pending timer', () => {
		vi.useFakeTimers();
		const scheduler = createTransitionStateScheduler();
		const glass = vi.fn();
		const expanded = vi.fn();

		scheduler.scheduleTransitionState('glassLinger', 1000, glass);
		scheduler.scheduleTransitionState('expandedTrack', 200, expanded);
		scheduler.cancelAll();
		vi.runAllTimers();

		expect(glass).not.toHaveBeenCalled();
		expect(expanded).not.toHaveBeenCalled();

		vi.useRealTimers();
	});
});
