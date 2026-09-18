import { hasClosest, isCourseCapsuleTarget } from './timetable-dom-utils';
import type { GridHandlerOptions, TimetableInteractionCore } from './timetable-interaction-types';

export function createGridHandlers(
	interaction: TimetableInteractionCore,
	options: GridHandlerOptions = {}
) {
	const { onEmptyLongPress, onClickEmpty } = options;
	return {
		onpointerdown: (event: PointerEvent) => {
			if (event.button !== 0) return;
			interaction.resetClickFlags();
			if (interaction.mode !== 'view' || interaction.isClickGuarded()) return;
			if (isCourseCapsuleTarget(event.target)) return;

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
			if (interaction.mode === 'dragging' || interaction.isClickGuarded()) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}
			if (interaction.mode === 'view') return;
			if (hasClosest(event.target)) {
				if (event.target.closest('.course-capsule') || event.target.closest('button')) {
					return;
				}
			}
			onClickEmpty?.(event);
		}
	};
}
