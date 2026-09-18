import type { Course } from '@chronos/core';
import type {
	CourseCardHandlerOptions,
	TimetableInteractionCore
} from './timetable-interaction-types';

export function createCourseCardHandlers(
	interaction: TimetableInteractionCore,
	course: Course,
	options: CourseCardHandlerOptions = {}
) {
	const { onCourseClick, onLongPress, onDragStart } = options;
	return {
		onpointerdown: (event: PointerEvent) => {
			if (event.button !== 0) return;
			interaction.resetClickFlags();
			if (interaction.mode === 'dragging' || interaction.isClickGuarded()) return;
			if (interaction.mode !== 'view') {
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
			interaction.notePointerUp(event);
		},
		onpointerleave: (event: PointerEvent) => {
			interaction.notePointerLost(event);
		},
		onpointercancel: (event: PointerEvent) => {
			interaction.notePointerCancel(event);
		},
		onclick: (event: MouseEvent) => {
			if (
				interaction.consumeClickSuppression() ||
				interaction.mode !== 'view' ||
				interaction.isClickGuarded()
			) {
				event.preventDefault();
				return;
			}
			onCourseClick?.(course);
		}
	};
}
