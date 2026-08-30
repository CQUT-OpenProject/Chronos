import type { Course } from '@chronos/core';

export const COURSE_CARD_DRAG_THRESHOLD_PX = 8;

export interface CourseCardGestureOptions {
	onCourseClick?: (course: Course) => void;
	dragThresholdPx?: number;
}

export function createCourseCardHandlers(course: Course, options: CourseCardGestureOptions = {}) {
	const { onCourseClick, dragThresholdPx = COURSE_CARD_DRAG_THRESHOLD_PX } = options;

	let hasMoved = false;
	let startX = 0;
	let startY = 0;
	let activePointerId: number | null = null;

	return {
		onpointerdown: (event: PointerEvent) => {
			if (event.button !== 0) return;

			activePointerId = event.pointerId;
			hasMoved = false;
			startX = event.clientX;
			startY = event.clientY;
		},
		onpointermove: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			if (hasMoved) return;

			const dx = Math.abs(event.clientX - startX);
			const dy = Math.abs(event.clientY - startY);
			if (dx > dragThresholdPx || dy > dragThresholdPx) {
				hasMoved = true;
			}
		},
		onpointerup: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			activePointerId = null;
		},
		onpointerleave: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			activePointerId = null;
		},
		onpointercancel: (event: PointerEvent) => {
			if (activePointerId !== null && event.pointerId !== activePointerId) return;
			activePointerId = null;
			hasMoved = false;
		},
		onclick: (event: MouseEvent) => {
			if (hasMoved) {
				event.preventDefault();
				hasMoved = false;
				return;
			}
			onCourseClick?.(course);
		}
	};
}
