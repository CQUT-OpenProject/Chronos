import { createCourseCardHandlers } from './course-card-gesture';
import { createDragSessionController } from './timetable-drag-session.svelte';
import { createGridHandlers } from './grid-gesture';
import { createLongPressTracker } from './timetable-long-press.svelte';
import {
	TIMETABLE_CLICK_GUARD_MS,
	TIMETABLE_LONG_PRESS_DELAY_MS,
	TIMETABLE_POINTER_THRESHOLD_PX
} from './timetable-interaction-types';
import type {
	CourseCardHandlerOptions,
	GridHandlerOptions,
	TimetableDragSession,
	TimetableInteractionMode,
	TimetableInteractionOptions
} from './timetable-interaction-types';

export {
	TIMETABLE_CLICK_GUARD_MS,
	TIMETABLE_LONG_PRESS_CLICK_SUPPRESS_MS,
	TIMETABLE_LONG_PRESS_DELAY_MS,
	TIMETABLE_POINTER_THRESHOLD_PX
} from './timetable-interaction-types';
export type {
	BeginDragInput,
	CourseCardHandlerOptions,
	DragGridGeometry,
	DragTargetPatch,
	GridHandlerOptions,
	TimetableDragSession,
	TimetableInteractionMode,
	TimetableInteractionOptions
} from './timetable-interaction-types';

export function createTimetableInteraction(options: TimetableInteractionOptions = {}) {
	const now = options.now ?? Date.now;
	const longPressDelayMs = options.longPressDelayMs ?? TIMETABLE_LONG_PRESS_DELAY_MS;
	const thresholdPx = options.thresholdPx ?? TIMETABLE_POINTER_THRESHOLD_PX;
	const clickGuardMs = options.clickGuardMs ?? TIMETABLE_CLICK_GUARD_MS;

	let mode = $state<TimetableInteractionMode>('view');
	let drag = $state<TimetableDragSession | null>(null);
	let clickGuardUntil = $state(0);

	function armClickGuard() {
		clickGuardUntil = now() + clickGuardMs;
	}

	const dragSession = createDragSessionController({
		thresholdPx,
		getDrag: () => drag,
		setDrag: (value) => {
			drag = value;
		},
		getMode: () => mode,
		setMode: (value) => {
			mode = value;
		},
		armClickGuard
	});

	const longPress = createLongPressTracker({
		longPressDelayMs,
		thresholdPx,
		getMode: () => mode
	});

	function enterEdit() {
		if (mode === 'dragging') return;
		mode = 'edit';
	}

	function enterEditFromLongPress(_event: PointerEvent) {
		enterEdit();
	}

	function exitEdit() {
		longPress.clear();
		dragSession.clearDragMoveLock();
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

	const interactionCore = {
		get mode() {
			return mode;
		},
		isClickGuarded: () => now() < clickGuardUntil,
		resetClickFlags: () => longPress.resetClickFlags(),
		enterEdit,
		enterEditFromLongPress,
		watchLongPress: (event: PointerEvent, onFire: (event: PointerEvent) => void) =>
			longPress.watchLongPress(event, onFire),
		notePointerMove(event: PointerEvent) {
			dragSession.tryReleaseDragMoveLock(event);
			longPress.notePointerMove(event);
		},
		notePointerUp: (event: PointerEvent) => longPress.notePointerUp(event),
		notePointerLost: (event: PointerEvent) => longPress.notePointerLost(event),
		notePointerCancel: (event: PointerEvent) => longPress.notePointerCancel(event),
		consumeClickSuppression: () => longPress.consumeClickSuppression()
	};

	function destroy() {
		longPress.clear();
		dragSession.clearDragMoveLock();
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
		beginDrag: (...args: Parameters<typeof dragSession.beginDrag>) =>
			dragSession.beginDrag(...args),
		updateDragTarget: (...args: Parameters<typeof dragSession.updateDragTarget>) =>
			dragSession.updateDragTarget(...args),
		updateDragFromPointer: (...args: Parameters<typeof dragSession.updateDragFromPointer>) =>
			dragSession.updateDragFromPointer(...args),
		setDragOverDeleteZone: (...args: Parameters<typeof dragSession.setDragOverDeleteZone>) =>
			dragSession.setDragOverDeleteZone(...args),
		endDrag: () => dragSession.endDrag(),
		cancelDrag: () => dragSession.cancelDrag(),
		watchLongPress: (event: PointerEvent, onFire: (event: PointerEvent) => void) =>
			longPress.watchLongPress(event, onFire),
		notePointerMove: (event: PointerEvent) => interactionCore.notePointerMove(event),
		notePagerFirstMove: () => longPress.notePagerFirstMove(),
		notePointerUp: (event: PointerEvent) => longPress.notePointerUp(event),
		notePointerLost: (event: PointerEvent) => longPress.notePointerLost(event),
		notePointerCancel: (event: PointerEvent) => longPress.notePointerCancel(event),
		createGridHandlers: (handlerOptions?: GridHandlerOptions) =>
			createGridHandlers(interactionCore, handlerOptions),
		createCourseCardHandlers: (
			course: import('@chronos/core').Course,
			handlerOptions?: CourseCardHandlerOptions
		) => createCourseCardHandlers(interactionCore, course, handlerOptions),
		isClickGuarded: () => interactionCore.isClickGuarded(),
		destroy
	};
}

export type TimetableInteraction = ReturnType<typeof createTimetableInteraction>;
