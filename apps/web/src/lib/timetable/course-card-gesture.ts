import type { Course } from '@chronos/core';

export const COURSE_CARD_DRAG_THRESHOLD_PX = 8;
export const COURSE_CARD_LONG_PRESS_DELAY_MS = 450;

export interface CourseCardGestureOptions {
	onCourseClick?: (course: Course) => void;
	onLongPress?: (course: Course, event: PointerEvent) => void;
	onDragStart?: (course: Course, event: PointerEvent) => void;
	isEditing?: boolean;
	dragThresholdPx?: number;
	longPressDelayMs?: number;
}

export function createCourseCardHandlers(course: Course, options: CourseCardGestureOptions = {}) {
	const {
		onCourseClick,
		onLongPress,
		onDragStart,
		isEditing = false,
		dragThresholdPx = COURSE_CARD_DRAG_THRESHOLD_PX,
		longPressDelayMs = COURSE_CARD_LONG_PRESS_DELAY_MS
	} = options;

	let hasMoved = false;
	let longPressFired = false;
	let startX = 0;
	let startY = 0;
	let activePointerId: number | null = null;
	let timer: ReturnType<typeof setTimeout> | null = null;

	function clearTimer() {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	return {
		onpointerdown: (event: PointerEvent) => {
			if (event.button !== 0) return;

			activePointerId = event.pointerId;
			hasMoved = false;
			longPressFired = false;
			startX = event.clientX;
			startY = event.clientY;

			clearTimer();

			if (isEditing) {
				onDragStart?.(course, event);
			} else if (onLongPress) {
				timer = setTimeout(() => {
					longPressFired = true;
					onLongPress(course, event);
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
		},
		onpointerleave: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			clearTimer();
			activePointerId = null;
		},
		onpointercancel: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			clearTimer();
			activePointerId = null;
			hasMoved = false;
		},
		onclick: (event: MouseEvent) => {
			clearTimer();
			if (hasMoved || longPressFired || isEditing) {
				event.preventDefault();
				hasMoved = false;
				longPressFired = false;
				return;
			}
			onCourseClick?.(course);
		}
	};
}
