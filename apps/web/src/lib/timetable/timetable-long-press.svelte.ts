import {
	TIMETABLE_LONG_PRESS_CLICK_SUPPRESS_MS,
	type TimetableInteractionMode
} from './timetable-interaction-types';

export interface LongPressTrackerOptions {
	longPressDelayMs: number;
	thresholdPx: number;
	getMode: () => TimetableInteractionMode;
}

export interface LongPressTracker {
	watchLongPress(event: PointerEvent, onFire: (event: PointerEvent) => void): boolean;
	notePointerMove(event: PointerEvent): void;
	notePagerFirstMove(): void;
	notePointerUp(event: PointerEvent): void;
	notePointerLost(event: PointerEvent): void;
	notePointerCancel(event: PointerEvent): void;
	consumeClickSuppression(): boolean;
	resetClickFlags(): void;
	clear(): void;
}

export function createLongPressTracker(options: LongPressTrackerOptions): LongPressTracker {
	let pendingPointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let hasMoved = false;
	let longPressFired = false;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let releaseTimer: ReturnType<typeof setTimeout> | null = null;
	let longPressCallback: ((event: PointerEvent) => void) | null = null;
	let longPressEvent: PointerEvent | null = null;

	function clearTimer() {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function clearReleaseTimer() {
		if (releaseTimer !== null) {
			clearTimeout(releaseTimer);
			releaseTimer = null;
		}
	}

	function resetClickFlags() {
		clearReleaseTimer();
		longPressFired = false;
		hasMoved = false;
	}

	function watchLongPress(event: PointerEvent, onFire: (event: PointerEvent) => void): boolean {
		if (event.button !== 0) return false;
		if (options.getMode() !== 'view') return false;

		pendingPointerId = event.pointerId;
		startX = event.clientX;
		startY = event.clientY;
		hasMoved = false;
		longPressFired = false;
		longPressCallback = onFire;
		longPressEvent = event;

		clearTimer();
		timer = setTimeout(() => {
			longPressFired = true;
			timer = null;
			const callback = longPressCallback;
			const sourceEvent = longPressEvent;
			longPressCallback = null;
			longPressEvent = null;
			if (callback && sourceEvent) callback(sourceEvent);
		}, options.longPressDelayMs);

		return true;
	}

	function notePointerMove(event: PointerEvent) {
		if (pendingPointerId !== null && event.pointerId !== pendingPointerId) return;
		if (pendingPointerId === null || hasMoved) return;

		const dx = Math.abs(event.clientX - startX);
		const dy = Math.abs(event.clientY - startY);
		if (dx > options.thresholdPx || dy > options.thresholdPx) {
			hasMoved = true;
			clearTimer();
		}
	}

	function notePagerFirstMove() {
		hasMoved = true;
		clearTimer();
		longPressCallback = null;
		longPressEvent = null;
	}

	function notePointerUp(event: PointerEvent) {
		if (pendingPointerId !== null && event.pointerId !== pendingPointerId) return;
		clearTimer();
		pendingPointerId = null;
		longPressCallback = null;
		longPressEvent = null;
		if (longPressFired) {
			clearReleaseTimer();
			releaseTimer = setTimeout(() => {
				longPressFired = false;
				releaseTimer = null;
			}, TIMETABLE_LONG_PRESS_CLICK_SUPPRESS_MS);
		}
	}

	function notePointerLost(event: PointerEvent) {
		if (pendingPointerId !== null && event.pointerId !== pendingPointerId) return;
		clearTimer();
		pendingPointerId = null;
		longPressCallback = null;
		longPressEvent = null;
	}

	function notePointerCancel(event: PointerEvent) {
		if (pendingPointerId !== null && event.pointerId !== pendingPointerId) return;
		clearTimer();
		clearReleaseTimer();
		pendingPointerId = null;
		hasMoved = false;
		longPressFired = false;
		longPressCallback = null;
		longPressEvent = null;
	}

	function consumeClickSuppression(): boolean {
		clearTimer();
		clearReleaseTimer();
		if (longPressFired) {
			longPressFired = false;
			return true;
		}
		if (hasMoved) {
			hasMoved = false;
			return true;
		}
		return false;
	}

	function clear() {
		clearTimer();
		clearReleaseTimer();
		pendingPointerId = null;
		longPressCallback = null;
		longPressEvent = null;
		hasMoved = false;
		longPressFired = false;
	}

	return {
		watchLongPress,
		notePointerMove,
		notePagerFirstMove,
		notePointerUp,
		notePointerLost,
		notePointerCancel,
		consumeClickSuppression,
		resetClickFlags,
		clear
	};
}
