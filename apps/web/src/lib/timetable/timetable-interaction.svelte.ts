import type { Course, PlacedCourseCapsule } from '@chronos/core';

export const TIMETABLE_POINTER_THRESHOLD_PX = 5;
export const TIMETABLE_LONG_PRESS_DELAY_MS = 450;
export const TIMETABLE_CLICK_GUARD_MS = 120;

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
	overDeleteZone: boolean;
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
	waitForMove?: boolean;
	originX?: number;
	originY?: number;
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
	onLongPressFeedback?: () => void;
}

interface DragMoveLock {
	pointerId: number;
	startX: number;
	startY: number;
}

interface PointerGesture {
	pointerId: number;
	startedMode: TimetableInteractionMode;
	startX: number;
	startY: number;
	hasMoved: boolean;
	longPressed: boolean;
	onLongPress: ((event: PointerEvent) => void) | null;
	sourceEvent: PointerEvent;
}

export interface TimetablePointerEnd {
	startedMode: TimetableInteractionMode;
	gesture: 'tap' | 'moved' | 'long-press';
}

export function createTimetableInteraction(options: TimetableInteractionOptions = {}) {
	const now = options.now ?? Date.now;
	const longPressDelayMs = options.longPressDelayMs ?? TIMETABLE_LONG_PRESS_DELAY_MS;
	const thresholdPx = options.thresholdPx ?? TIMETABLE_POINTER_THRESHOLD_PX;
	const clickGuardMs = options.clickGuardMs ?? TIMETABLE_CLICK_GUARD_MS;
	const onLongPressFeedback = options.onLongPressFeedback;

	let mode = $state<TimetableInteractionMode>('view');
	let drag = $state<TimetableDragSession | null>(null);
	let clickGuardUntil = $state(0);

	let pointerGesture: PointerGesture | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let dragMoveLock: DragMoveLock | null = null;

	function clearTimer() {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	function armClickGuard() {
		clickGuardUntil = now() + clickGuardMs;
	}

	function clearPointerGesture() {
		clearTimer();
		pointerGesture = null;
	}

	function clearDragMoveLock() {
		dragMoveLock = null;
	}

	function enterEditFromLongPress(_event: PointerEvent) {
		enterEdit();
		onLongPressFeedback?.();
	}

	function tryReleaseDragMoveLock(event: PointerEvent): boolean {
		if (!dragMoveLock || event.pointerId !== dragMoveLock.pointerId) return false;
		const dx = Math.abs(event.clientX - dragMoveLock.startX);
		const dy = Math.abs(event.clientY - dragMoveLock.startY);
		if (dx <= thresholdPx && dy <= thresholdPx) return false;
		clearDragMoveLock();
		return true;
	}

	function discardLockedDrag(): boolean {
		if (!drag || !dragMoveLock) return false;
		clearDragMoveLock();
		drag = null;
		mode = 'edit';
		return true;
	}

	function enterEdit() {
		if (mode === 'dragging') return;
		mode = 'edit';
	}

	function exitEdit() {
		clearPointerGesture();
		clearDragMoveLock();
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
		const { waitForMove = false, originX = 0, originY = 0, ...session } = input;
		drag = { ...session, overDeleteZone: false };
		dragMoveLock = waitForMove
			? { pointerId: session.pointerId, startX: originX, startY: originY }
			: null;
		mode = 'dragging';
		return true;
	}

	function updateDragTarget(patch: DragTargetPatch): boolean {
		if (!drag || dragMoveLock) return false;
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

	function setDragOverDeleteZone(over: boolean): boolean {
		if (!drag || dragMoveLock) return false;
		if (drag.overDeleteZone === over) return false;
		drag.overDeleteZone = over;
		return true;
	}

	function endDrag(): TimetableDragSession | null {
		if (discardLockedDrag()) return null;
		if (mode !== 'dragging' || !drag) return null;
		const current = drag;
		drag = null;
		mode = current.persistAfterDrop ? 'edit' : 'view';
		armClickGuard();
		return current;
	}

	function cancelDrag(): TimetableDragSession | null {
		if (discardLockedDrag()) return null;
		if (mode !== 'dragging' || !drag) return null;
		const current = drag;
		drag = null;
		mode = current.persistAfterDrop ? 'edit' : 'view';
		armClickGuard();
		return current;
	}

	function watchLongPress(event: PointerEvent, onFire: (event: PointerEvent) => void): boolean {
		if (event.button !== 0) return false;
		if (mode !== 'view') return false;

		clearPointerGesture();
		const gesture: PointerGesture = {
			pointerId: event.pointerId,
			startedMode: mode,
			startX: event.clientX,
			startY: event.clientY,
			hasMoved: false,
			longPressed: false,
			onLongPress: onFire,
			sourceEvent: event
		};
		pointerGesture = gesture;
		timer = setTimeout(() => {
			if (pointerGesture !== gesture || gesture.hasMoved) return;
			timer = null;
			gesture.longPressed = true;
			gesture.onLongPress?.(gesture.sourceEvent);
			gesture.onLongPress = null;
		}, longPressDelayMs);

		return true;
	}

	function notePointerMove(event: PointerEvent) {
		tryReleaseDragMoveLock(event);

		if (
			!pointerGesture ||
			event.pointerId !== pointerGesture.pointerId ||
			pointerGesture.hasMoved
		) {
			return;
		}

		const dx = Math.abs(event.clientX - pointerGesture.startX);
		const dy = Math.abs(event.clientY - pointerGesture.startY);
		if (dx > thresholdPx || dy > thresholdPx) {
			pointerGesture.hasMoved = true;
			clearTimer();
		}
	}

	function notePagerFirstMove() {
		if (!pointerGesture) return;
		pointerGesture.hasMoved = true;
		clearTimer();
		pointerGesture.onLongPress = null;
	}

	function notePointerUp(event: PointerEvent): TimetablePointerEnd | null {
		if (!pointerGesture || event.pointerId !== pointerGesture.pointerId) return null;
		const gesture = pointerGesture;
		clearPointerGesture();
		return {
			startedMode: gesture.startedMode,
			gesture: gesture.longPressed ? 'long-press' : gesture.hasMoved ? 'moved' : 'tap'
		};
	}

	function notePointerLost(event: PointerEvent) {
		if (!pointerGesture || event.pointerId !== pointerGesture.pointerId) return;
		clearPointerGesture();
	}

	function notePointerCancel(event: PointerEvent) {
		if (!pointerGesture || event.pointerId !== pointerGesture.pointerId) return;
		clearPointerGesture();
	}

	function watchEditTap(event: PointerEvent): boolean {
		if (event.button !== 0 || mode !== 'edit') return false;
		clearPointerGesture();
		pointerGesture = {
			pointerId: event.pointerId,
			startedMode: mode,
			startX: event.clientX,
			startY: event.clientY,
			hasMoved: false,
			longPressed: false,
			onLongPress: null,
			sourceEvent: event
		};
		return true;
	}

	function isClickGuarded(): boolean {
		return now() < clickGuardUntil;
	}

	function destroy() {
		clearPointerGesture();
		clearDragMoveLock();
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
		enterEditFromLongPress,
		exitEdit,
		toggleEditing,
		beginDrag,
		updateDragTarget,
		setDragOverDeleteZone,
		endDrag,
		cancelDrag,
		watchLongPress,
		watchEditTap,
		notePointerMove,
		notePagerFirstMove,
		notePointerUp,
		notePointerLost,
		notePointerCancel,
		isClickGuarded,
		destroy
	};
}

export type TimetableInteraction = ReturnType<typeof createTimetableInteraction>;
