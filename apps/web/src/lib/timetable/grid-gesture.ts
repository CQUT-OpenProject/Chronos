export const GRID_GESTURE_DRAG_THRESHOLD_PX = 8;
export const GRID_GESTURE_LONG_PRESS_DELAY_MS = 450;

export interface GridGestureOptions {
	onLongPress?: (event: PointerEvent) => void;
	onClickEmpty?: (event: MouseEvent) => void;
	isEditing?: boolean | (() => boolean);
	isDragging?: boolean | (() => boolean);
	dragThresholdPx?: number;
	longPressDelayMs?: number;
}

function hasClosest(target: unknown): target is { closest: (selector: string) => unknown } {
	return (
		typeof target === 'object' &&
		target !== null &&
		'closest' in target &&
		typeof (target as { closest?: unknown }).closest === 'function'
	);
}

function isExcludedTarget(target: EventTarget | null): boolean {
	if (!hasClosest(target)) return false;
	return Boolean(target.closest('.course-capsule'));
}

export function createGridGestureHandlers(options: GridGestureOptions = {}) {
	const {
		onLongPress,
		onClickEmpty,
		isEditing = false,
		isDragging = false,
		dragThresholdPx = GRID_GESTURE_DRAG_THRESHOLD_PX,
		longPressDelayMs = GRID_GESTURE_LONG_PRESS_DELAY_MS
	} = options;

	let hasMoved = false;
	let longPressFired = false;
	let startX = 0;
	let startY = 0;
	let activePointerId: number | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let releaseTimer: ReturnType<typeof setTimeout> | null = null;

	function checkIsEditing(): boolean {
		return typeof isEditing === 'function' ? isEditing() : Boolean(isEditing);
	}

	function checkIsDragging(): boolean {
		return typeof isDragging === 'function' ? isDragging() : Boolean(isDragging);
	}

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

	return {
		onpointerdown: (event: PointerEvent) => {
			if (event.button !== 0) return;
			clearReleaseTimer();
			longPressFired = false;
			if (checkIsEditing() || checkIsDragging()) return;
			if (isExcludedTarget(event.target)) return;

			activePointerId = event.pointerId;
			hasMoved = false;
			startX = event.clientX;
			startY = event.clientY;

			clearTimer();

			if (onLongPress) {
				timer = setTimeout(() => {
					longPressFired = true;
					timer = null;
					onLongPress(event);
				}, longPressDelayMs);
			}
		},
		onpointermove: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			if (hasMoved) return;

			const dx = Math.abs(event.clientX - startX);
			const dy = Math.abs(event.clientY - startY);
			if (dx > dragThresholdPx || dy > dragThresholdPx) {
				hasMoved = true;
				clearTimer();
			}
		},
		onpointerup: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			clearTimer();
			activePointerId = null;
			if (longPressFired) {
				clearReleaseTimer();
				releaseTimer = setTimeout(() => {
					longPressFired = false;
					releaseTimer = null;
				}, 50);
			}
		},
		onpointerleave: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			clearTimer();
			activePointerId = null;
		},
		onpointercancel: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			clearTimer();
			clearReleaseTimer();
			activePointerId = null;
			hasMoved = false;
			longPressFired = false;
		},
		onclick: (event: MouseEvent) => {
			clearTimer();
			clearReleaseTimer();
			if (longPressFired) {
				longPressFired = false;
				event.preventDefault();
				event.stopPropagation();
				return;
			}
			if (checkIsDragging()) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}
			if (checkIsEditing()) {
				if (hasClosest(event.target)) {
					if (event.target.closest('.course-capsule') || event.target.closest('button')) {
						return;
					}
				}
				onClickEmpty?.(event);
			}
		}
	};
}
