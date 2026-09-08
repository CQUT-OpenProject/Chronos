import type { Course, PlacedCourseCapsule } from '@chronos/core';

export const TIMETABLE_POINTER_THRESHOLD_PX = 5;
export const TIMETABLE_LONG_PRESS_DELAY_MS = 450;
export const TIMETABLE_CLICK_GUARD_MS = 120;
export const TIMETABLE_LONG_PRESS_CLICK_SUPPRESS_MS = 50;

export type TimetableInteractionMode = 'view' | 'edit' | 'dragging';

export interface TimetableDragSession {
	course: Course;
	placed: PlacedCourseCapsule;
	pointerId: number;
	week: number;
	targetColIndex: number;
	targetDayOfWeek: number;
	targetStartPeriod: number;
	persistAfterDrop: boolean;
}

export interface BeginDragInput {
	course: Course;
	placed: PlacedCourseCapsule;
	pointerId: number;
	week: number;
	targetColIndex: number;
	targetDayOfWeek: number;
	targetStartPeriod: number;
	persistAfterDrop: boolean;
}

export interface DragTargetPatch {
	targetColIndex: number;
	targetDayOfWeek: number;
	targetStartPeriod: number;
}

export interface TimetableInteractionOptions {
	now?: () => number;
	longPressDelayMs?: number;
	thresholdPx?: number;
	clickGuardMs?: number;
}

export function createTimetableInteraction(options: TimetableInteractionOptions = {}) {
	const now = options.now ?? Date.now;
	const longPressDelayMs = options.longPressDelayMs ?? TIMETABLE_LONG_PRESS_DELAY_MS;
	const thresholdPx = options.thresholdPx ?? TIMETABLE_POINTER_THRESHOLD_PX;
	const clickGuardMs = options.clickGuardMs ?? TIMETABLE_CLICK_GUARD_MS;

	let mode = $state<TimetableInteractionMode>('view');
	let drag = $state<TimetableDragSession | null>(null);
	let clickGuardUntil = $state(0);

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

	function armClickGuard() {
		clickGuardUntil = now() + clickGuardMs;
	}

	function enterEdit() {
		if (mode === 'dragging') return;
		mode = 'edit';
	}

	function exitEdit() {
		clearTimer();
		clearReleaseTimer();
		pendingPointerId = null;
		longPressCallback = null;
		longPressEvent = null;
		if (drag) {
			drag = null;
			armClickGuard();
		}
		mode = 'view';
	}

	function toggleEditing() {
		if (mode === 'view') enterEdit();
		else exitEdit();
	}

	function beginDrag(input: BeginDragInput): boolean {
		if (mode === 'dragging') return false;
		drag = { ...input };
		mode = 'dragging';
		return true;
	}

	function updateDragTarget(patch: DragTargetPatch): boolean {
		if (!drag) return false;
		if (
			drag.targetColIndex === patch.targetColIndex &&
			drag.targetDayOfWeek === patch.targetDayOfWeek &&
			drag.targetStartPeriod === patch.targetStartPeriod
		) {
			return false;
		}
		drag.targetColIndex = patch.targetColIndex;
		drag.targetDayOfWeek = patch.targetDayOfWeek;
		drag.targetStartPeriod = patch.targetStartPeriod;
		return true;
	}

	function endDrag(): TimetableDragSession | null {
		if (mode !== 'dragging' || !drag) return null;
		const current = drag;
		drag = null;
		mode = current.persistAfterDrop ? 'edit' : 'view';
		armClickGuard();
		return current;
	}

	function cancelDrag(): TimetableDragSession | null {
		if (mode !== 'dragging' || !drag) return null;
		const current = drag;
		drag = null;
		mode = current.persistAfterDrop ? 'edit' : 'view';
		armClickGuard();
		return current;
	}

	function resetClickFlags() {
		clearReleaseTimer();
		longPressFired = false;
		hasMoved = false;
	}

	function watchLongPress(event: PointerEvent, onFire: (event: PointerEvent) => void): boolean {
		if (event.button !== 0) return false;
		if (mode !== 'view') return false;

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
		}, longPressDelayMs);

		return true;
	}

	function notePointerMove(event: PointerEvent) {
		if (pendingPointerId !== null && event.pointerId !== pendingPointerId) return;
		if (pendingPointerId === null || hasMoved) return;

		const dx = Math.abs(event.clientX - startX);
		const dy = Math.abs(event.clientY - startY);
		if (dx > thresholdPx || dy > thresholdPx) {
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

	function isClickGuarded(): boolean {
		return now() < clickGuardUntil;
	}

	function destroy() {
		clearTimer();
		clearReleaseTimer();
		pendingPointerId = null;
		longPressCallback = null;
		longPressEvent = null;
		drag = null;
		mode = 'view';
		clickGuardUntil = 0;
	}

	return {
		get mode() {
			return mode;
		},
		get drag() {
			return drag;
		},
		get isEditing() {
			return mode !== 'view';
		},
		get isDragging() {
			return mode === 'dragging';
		},
		get allowPagerTouch() {
			return mode === 'view';
		},
		enterEdit,
		exitEdit,
		toggleEditing,
		beginDrag,
		updateDragTarget,
		endDrag,
		cancelDrag,
		resetClickFlags,
		watchLongPress,
		notePointerMove,
		notePagerFirstMove,
		notePointerUp,
		notePointerLost,
		notePointerCancel,
		consumeClickSuppression,
		isClickGuarded,
		destroy
	};
}

export type TimetableInteraction = ReturnType<typeof createTimetableInteraction>;
