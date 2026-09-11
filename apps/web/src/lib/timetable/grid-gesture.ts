import {
	TIMETABLE_POINTER_THRESHOLD_PX,
	TIMETABLE_LONG_PRESS_DELAY_MS,
	type TimetableInteraction
} from './timetable-interaction.svelte';

export const GRID_GESTURE_DRAG_THRESHOLD_PX = TIMETABLE_POINTER_THRESHOLD_PX;
export const GRID_GESTURE_LONG_PRESS_DELAY_MS = TIMETABLE_LONG_PRESS_DELAY_MS;

export interface GridGestureOptions {
	interaction: TimetableInteraction;
	onEmptyLongPress?: (event: PointerEvent) => void;
	onClickEmpty?: (event: PointerEvent) => void;
}

function hasClosest(target: unknown): target is { closest: (selector: string) => unknown } {
	return (
		typeof target === 'object' &&
		target !== null &&
		'closest' in target &&
		typeof (target as { closest?: unknown }).closest === 'function'
	);
}

function isCourseTarget(target: EventTarget | null): boolean {
	if (!hasClosest(target)) return false;
	return Boolean(target.closest('.course-capsule'));
}

function isInteractiveTarget(target: EventTarget | null): boolean {
	if (!hasClosest(target)) return false;
	return Boolean(target.closest('.course-capsule') || target.closest('button'));
}

export function createGridGestureHandlers(options: GridGestureOptions) {
	const { interaction, onEmptyLongPress, onClickEmpty } = options;

	return {
		onpointerdown: (event: PointerEvent) => {
			if (event.button !== 0) return;
			if (interaction.isDragging || interaction.isClickGuarded()) return;
			if (interaction.isEditing) {
				if (!isInteractiveTarget(event.target)) interaction.watchEditTap(event);
				return;
			}
			if (isCourseTarget(event.target)) return;

			interaction.watchLongPress(event, (pressEvent) => {
				if (onEmptyLongPress) {
					onEmptyLongPress(pressEvent);
				} else {
					interaction.enterEditFromLongPress(pressEvent);
				}
			});
		},
		onpointermove: (event: PointerEvent) => {
			interaction.notePointerMove(event);
		},
		onpointerup: (event: PointerEvent) => {
			const result = interaction.notePointerUp(event);
			if (result?.startedMode === 'edit' && result.gesture === 'tap') {
				onClickEmpty?.(event);
			}
		},
		onpointerleave: (event: PointerEvent) => {
			interaction.notePointerLost(event);
		},
		onpointercancel: (event: PointerEvent) => {
			interaction.notePointerCancel(event);
		}
	};
}
