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
	onClickEmpty?: (event: MouseEvent) => void;
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

export function createGridGestureHandlers(options: GridGestureOptions) {
	const { interaction, onEmptyLongPress, onClickEmpty } = options;

	return {
		onpointerdown: (event: PointerEvent) => {
			if (event.button !== 0) return;
			interaction.resetClickFlags();
			if (interaction.isEditing || interaction.isDragging || interaction.isClickGuarded()) return;
			if (isExcludedTarget(event.target)) return;

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
			interaction.notePointerUp(event);
		},
		onpointerleave: (event: PointerEvent) => {
			interaction.notePointerLost(event);
		},
		onpointercancel: (event: PointerEvent) => {
			interaction.notePointerCancel(event);
		},
		onclick: (event: MouseEvent) => {
			if (interaction.consumeClickSuppression()) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}
			if (interaction.isDragging || interaction.isClickGuarded()) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}
			if (interaction.isEditing) {
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
