import type { Course } from '@chronos/core';
import {
	TIMETABLE_POINTER_THRESHOLD_PX,
	TIMETABLE_LONG_PRESS_DELAY_MS,
	type TimetableInteraction
} from './timetable-interaction.svelte';

export const COURSE_CARD_DRAG_THRESHOLD_PX = TIMETABLE_POINTER_THRESHOLD_PX;
export const COURSE_CARD_LONG_PRESS_DELAY_MS = TIMETABLE_LONG_PRESS_DELAY_MS;

export interface CourseCardGestureOptions {
	interaction: TimetableInteraction;
	onCourseClick?: (course: Course) => void;
	onLongPress?: (course: Course, event: PointerEvent) => void;
	onDragStart?: (course: Course, event: PointerEvent) => void;
}

export function createCourseCardHandlers(course: Course, options: CourseCardGestureOptions) {
	const { interaction, onCourseClick, onLongPress, onDragStart } = options;

	return {
		onpointerdown: (event: PointerEvent) => {
			if (event.button !== 0) return;

			if (interaction.isDragging || interaction.isClickGuarded()) return;

			if (interaction.isEditing) {
				onDragStart?.(course, event);
				return;
			}

			interaction.watchLongPress(event, (pressEvent) => {
				onLongPress?.(course, pressEvent);
			});
		},
		onpointermove: (event: PointerEvent) => {
			interaction.notePointerMove(event);
		},
		onpointerup: (event: PointerEvent) => {
			const result = interaction.notePointerUp(event);
			if (result?.startedMode === 'view' && result.gesture === 'tap') {
				onCourseClick?.(course);
			}
		},
		onpointerleave: (event: PointerEvent) => {
			interaction.notePointerLost(event);
		},
		onpointercancel: (event: PointerEvent) => {
			interaction.notePointerCancel(event);
		},
		onclick: (event: MouseEvent) => {
			if (
				event.detail !== 0 ||
				interaction.isEditing ||
				interaction.isDragging ||
				interaction.isClickGuarded()
			) {
				event.preventDefault();
				return;
			}
			onCourseClick?.(course);
		}
	};
}
