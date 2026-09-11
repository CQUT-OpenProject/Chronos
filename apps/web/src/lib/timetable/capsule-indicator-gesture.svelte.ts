import { haptic } from '$lib/haptic/haptic';
import { createRafCoalescer } from '$lib/utils/raf-coalescer';
import { createThrottledCallback } from '$lib/utils/throttle';

export interface CapsuleIndicatorGestureOptions {
	getStartWeek: () => number;
	getEndWeek: () => number;
	getDisplayedWeek: () => number;
	onWeekChange: (week: number) => void;
	onScrubStartFeedback?: () => void;
	onWeekStepFeedback?: () => void;
}

function trySetPointerCapture(target: HTMLElement | null, pointerId: number): void {
	if (target?.setPointerCapture) {
		try {
			target.setPointerCapture(pointerId);
		} catch {
			// Ignore
		}
	}
}

function tryReleasePointerCapture(element: HTMLElement | null, pointerId: number): void {
	if (element && element.hasPointerCapture(pointerId)) {
		try {
			element.releasePointerCapture(pointerId);
		} catch {
			// Ignore
		}
	}
}

export function createCapsuleIndicatorGesture({
	getStartWeek,
	getEndWeek,
	getDisplayedWeek,
	onWeekChange,
	onScrubStartFeedback = () => haptic.medium(),
	onWeekStepFeedback = () => haptic.light()
}: CapsuleIndicatorGestureOptions) {
	let isScrubbing = $state(false);
	let scrubWeek = $state(1);
	let activePointerId = $state<number | null>(null);
	let containerEl = $state<HTMLElement | null>(null);

	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let startX = 0;
	let startY = 0;
	let scrubStartX = 0;
	let scrubStartWeek = 1;
	let scrubStepPx = 14;

	const weekChangeRaf = createRafCoalescer(onWeekChange);
	const triggerStepFeedback = createThrottledCallback(onWeekStepFeedback, 35);

	function applyWeekStep(week: number): void {
		if (scrubWeek === week) return;
		scrubWeek = week;
		triggerStepFeedback();
		weekChangeRaf.schedule(week);
	}

	function startScrubbing(clientX: number): void {
		if (isScrubbing) return;
		isScrubbing = true;
		scrubStartWeek = getDisplayedWeek();
		scrubStartX = clientX;
		scrubWeek = scrubStartWeek;

		// Sample step metrics once on activation to eliminate layout thrashing during high-frequency pointermove
		const totalWeeks = Math.max(1, getEndWeek() - getStartWeek() + 1);
		const rect = containerEl?.getBoundingClientRect();
		const width = rect?.width || 240;
		scrubStepPx = Math.max(10, width / (totalWeeks + 1));

		onScrubStartFeedback();
	}

	function updateWeekFromDelta(clientX: number): void {
		const startWeek = getStartWeek();
		const endWeek = getEndWeek();

		const deltaX = clientX - scrubStartX;
		const deltaWeeks = Math.round(deltaX / scrubStepPx);
		const targetWeek = Math.max(startWeek, Math.min(endWeek, scrubStartWeek + deltaWeeks));

		applyWeekStep(targetWeek);
	}

	function onPointerDown(e: PointerEvent): void {
		if (e.button !== 0) return;
		const startWeek = getStartWeek();
		const endWeek = getEndWeek();
		if (startWeek >= endWeek) return;

		activePointerId = e.pointerId;
		startX = e.clientX;
		startY = e.clientY;

		trySetPointerCapture(containerEl, e.pointerId);

		if (longPressTimer) clearTimeout(longPressTimer);
		longPressTimer = setTimeout(() => {
			longPressTimer = null;
			startScrubbing(startX);
		}, 220);
	}

	function onPointerMove(e: PointerEvent): void {
		if (activePointerId !== e.pointerId) return;

		if (isScrubbing) {
			e.preventDefault();
			updateWeekFromDelta(e.clientX);
			return;
		}

		const dx = Math.abs(e.clientX - startX);
		const dy = Math.abs(e.clientY - startY);

		if (dx > 8 || dy > 8) {
			if (longPressTimer) {
				clearTimeout(longPressTimer);
				longPressTimer = null;
			}
			tryReleasePointerCapture(containerEl, e.pointerId);
			activePointerId = null;
		}
	}

	function finishPointerInteraction(pointerId: number, commit: boolean): void {
		tryReleasePointerCapture(containerEl, pointerId);
		activePointerId = null;

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		} else if (isScrubbing) {
			isScrubbing = false;
			if (commit) {
				weekChangeRaf.flush(scrubWeek);
			} else {
				weekChangeRaf.cancel();
				onWeekChange(scrubStartWeek);
			}
		}
	}

	function onPointerUp(e: PointerEvent): void {
		if (activePointerId !== e.pointerId) return;
		finishPointerInteraction(e.pointerId, true);
	}

	function onPointerCancel(e: PointerEvent): void {
		if (activePointerId !== e.pointerId) return;
		finishPointerInteraction(e.pointerId, false);
	}

	function destroy(): void {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		weekChangeRaf.cancel();
	}

	return {
		get isScrubbing() {
			return isScrubbing;
		},
		get scrubWeek() {
			return scrubWeek;
		},
		get isActive() {
			return activePointerId !== null || isScrubbing;
		},
		get containerEl() {
			return containerEl;
		},
		set containerEl(el: HTMLElement | null) {
			containerEl = el;
		},
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onPointerCancel,
		destroy
	};
}

export type CapsuleIndicatorGesture = ReturnType<typeof createCapsuleIndicatorGesture>;
