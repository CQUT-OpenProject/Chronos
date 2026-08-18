import type { Course } from '$lib/models/course';
import { haptic } from '$lib/haptic/haptic';

export const COURSE_CARD_LONG_PRESS_DELAY_MS = 500;
export const COURSE_CARD_DRAG_THRESHOLD_PX = 8;

export interface CourseCardGestureOptions {
	onCourseClick?: (course: Course) => void;
	onCourseLongClick?: (course: Course) => void;
	onLongPressFeedback?: () => void;
	longPressDelayMs?: number;
	dragThresholdPx?: number;
}

export function createCourseCardHandlers(course: Course, options: CourseCardGestureOptions = {}) {
	const {
		onCourseClick,
		onCourseLongClick,
		onLongPressFeedback = () => haptic.heavy(),
		longPressDelayMs = COURSE_CARD_LONG_PRESS_DELAY_MS,
		dragThresholdPx = COURSE_CARD_DRAG_THRESHOLD_PX
	} = options;

	let longPressTimer: ReturnType<typeof setTimeout> | undefined;
	let didLongPress = false;
	let hasMoved = false;
	let startX = 0;
	let startY = 0;
	let activePointerId: number | null = null;

	function clearTimer() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = undefined;
		}
	}

	return {
		oncontextmenu: (event: Event) => {
			event.preventDefault();
			onCourseLongClick?.(course);
		},
		onpointerdown: (event: PointerEvent) => {
			if (!onCourseLongClick) return;
			if (event.button !== 0) return;

			activePointerId = event.pointerId;
			didLongPress = false;
			hasMoved = false;
			startX = event.clientX;
			startY = event.clientY;

			clearTimer();
			longPressTimer = setTimeout(() => {
				didLongPress = true;
				onLongPressFeedback();
				onCourseLongClick(course);
			}, longPressDelayMs);
		},
		onpointermove: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			if (!longPressTimer && hasMoved) return;

			const dx = Math.abs(event.clientX - startX);
			const dy = Math.abs(event.clientY - startY);
			if (dx > dragThresholdPx || dy > dragThresholdPx) {
				hasMoved = true;
				clearTimer();
			}
		},
		onpointerup: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			activePointerId = null;
			clearTimer();
		},
		onpointerleave: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			activePointerId = null;
			clearTimer();
		},
		onpointercancel: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			activePointerId = null;
			clearTimer();
			hasMoved = false;
			didLongPress = false;
		},
		onclick: (event: MouseEvent) => {
			if (didLongPress || hasMoved) {
				event.preventDefault();
				didLongPress = false;
				hasMoved = false;
				return;
			}
			onCourseClick?.(course);
		},
		onkeydown: (event: KeyboardEvent) => {
			if (event.key === 'Enter' && event.shiftKey && onCourseLongClick) {
				event.preventDefault();
				onCourseLongClick(course);
			}
		}
	};
}
