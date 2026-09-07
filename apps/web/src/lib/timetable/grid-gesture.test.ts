import { describe, expect, it, vi } from 'vite-plus/test';
import { createGridGestureHandlers, GRID_GESTURE_DRAG_THRESHOLD_PX } from './grid-gesture';

function createMockElement(closestMatch: string | null = null) {
	return {
		closest: (selector: string) => {
			if (!closestMatch) return null;
			return selector.includes(closestMatch) ? {} : null;
		}
	};
}

function mockPointerEvent(init: Partial<PointerEvent> = {}): PointerEvent {
	return {
		button: 0,
		pointerId: 1,
		clientX: 0,
		clientY: 0,
		target: createMockElement(),
		preventDefault: () => {},
		stopPropagation: () => {},
		...init
	} as unknown as PointerEvent;
}

function mockMouseEvent(init: Partial<MouseEvent> = {}): MouseEvent {
	return {
		button: 0,
		target: createMockElement(),
		preventDefault: () => {},
		stopPropagation: () => {},
		...init
	} as unknown as MouseEvent;
}

describe('createGridGestureHandlers', () => {
	it('triggers onLongPress after delay and suppresses subsequent click', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const onClickEmpty = vi.fn();
			let isEditing = false;
			const handlers = createGridGestureHandlers({
				onLongPress,
				onClickEmpty,
				isEditing: () => isEditing,
				longPressDelayMs: 400
			});

			const downEvt = mockPointerEvent({ clientX: 50, clientY: 50 });
			handlers.onpointerdown(downEvt);

			expect(onLongPress).not.toHaveBeenCalled();

			vi.advanceTimersByTime(400);
			expect(onLongPress).toHaveBeenCalledWith(downEvt);

			// Edit mode entered
			isEditing = true;

			// Releasing pointer triggers click
			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));
			const clickEvt = mockMouseEvent();
			handlers.onclick(clickEvt);

			// Click must be suppressed right after long press
			expect(onClickEmpty).not.toHaveBeenCalled();

			// Subsequent click on empty space should exit edit mode
			handlers.onclick(mockMouseEvent());
			expect(onClickEmpty).toHaveBeenCalledTimes(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it('exits edit mode on the very first click after long press when no click was fired on pointerup (touch/mobile)', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const onClickEmpty = vi.fn();
			let isEditing = false;
			const handlers = createGridGestureHandlers({
				onLongPress,
				onClickEmpty,
				isEditing: () => isEditing,
				longPressDelayMs: 400
			});

			const downEvt = mockPointerEvent({ clientX: 50, clientY: 50 });
			handlers.onpointerdown(downEvt);
			vi.advanceTimersByTime(400);
			expect(onLongPress).toHaveBeenCalledWith(downEvt);

			// Edit mode entered
			isEditing = true;

			// Releasing pointer (no click fired by browser on touch devices)
			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));

			// User clicks on empty space to exit edit mode (only 1 click!)
			handlers.onpointerdown(mockPointerEvent({ clientX: 100, clientY: 100 }));
			handlers.onpointerup(mockPointerEvent({ clientX: 100, clientY: 100 }));
			handlers.onclick(mockMouseEvent());

			expect(onClickEmpty).toHaveBeenCalledTimes(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it('clears longPressFired after release timer even if next click has no pointerdown', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const onClickEmpty = vi.fn();
			let isEditing = false;
			const handlers = createGridGestureHandlers({
				onLongPress,
				onClickEmpty,
				isEditing: () => isEditing,
				longPressDelayMs: 400
			});

			const downEvt = mockPointerEvent({ clientX: 50, clientY: 50 });
			handlers.onpointerdown(downEvt);
			vi.advanceTimersByTime(400);
			expect(onLongPress).toHaveBeenCalledWith(downEvt);

			isEditing = true;
			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));

			// Advance beyond 50ms release timer
			vi.advanceTimersByTime(60);

			// Direct click without pointerdown should still exit edit mode on 1st click
			handlers.onclick(mockMouseEvent());
			expect(onClickEmpty).toHaveBeenCalledTimes(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press when pointer moves beyond drag threshold', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const handlers = createGridGestureHandlers({
				onLongPress,
				longPressDelayMs: 400
			});

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(200);

			handlers.onpointermove(
				mockPointerEvent({
					clientX: 50 + GRID_GESTURE_DRAG_THRESHOLD_PX + 2,
					clientY: 50
				})
			);
			vi.advanceTimersByTime(300);

			expect(onLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press on pointerup before delay', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const handlers = createGridGestureHandlers({
				onLongPress,
				longPressDelayMs: 400
			});

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(200);
			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));

			vi.advanceTimersByTime(300);
			expect(onLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press on pointercancel or pointerleave', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const handlers = createGridGestureHandlers({
				onLongPress,
				longPressDelayMs: 400
			});

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(200);
			handlers.onpointercancel(mockPointerEvent({ clientX: 50, clientY: 50 }));

			vi.advanceTimersByTime(300);
			expect(onLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('ignores target that is inside a course-capsule', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const handlers = createGridGestureHandlers({
				onLongPress,
				longPressDelayMs: 400
			});

			const capsuleTarget = createMockElement('.course-capsule');
			handlers.onpointerdown(
				mockPointerEvent({
					target: capsuleTarget as unknown as EventTarget,
					clientX: 50,
					clientY: 50
				})
			);
			vi.advanceTimersByTime(500);

			expect(onLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('does not start long press timer when already in editing mode', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const handlers = createGridGestureHandlers({
				onLongPress,
				isEditing: true,
				longPressDelayMs: 400
			});

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(500);

			expect(onLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('does not exit edit mode when clicking on a button or capsule in edit mode', () => {
		const onClickEmpty = vi.fn();
		const handlers = createGridGestureHandlers({
			onClickEmpty,
			isEditing: true
		});

		const buttonTarget = createMockElement('button');
		handlers.onclick(mockMouseEvent({ target: buttonTarget as unknown as EventTarget }));
		expect(onClickEmpty).not.toHaveBeenCalled();

		const capsuleTarget = createMockElement('.course-capsule');
		handlers.onclick(mockMouseEvent({ target: capsuleTarget as unknown as EventTarget }));
		expect(onClickEmpty).not.toHaveBeenCalled();
	});

	it('ignores non-primary pointer button', () => {
		vi.useFakeTimers();
		try {
			const onLongPress = vi.fn();
			const handlers = createGridGestureHandlers({
				onLongPress,
				longPressDelayMs: 400
			});

			handlers.onpointerdown(mockPointerEvent({ button: 2, clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(500);

			expect(onLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('suppresses click and does not exit edit mode when isDragging is true', () => {
		const onClickEmpty = vi.fn();
		let isDragging = true;
		const handlers = createGridGestureHandlers({
			onClickEmpty,
			isEditing: true,
			isDragging: () => isDragging
		});

		const clickEvt = mockMouseEvent();
		handlers.onclick(clickEvt);
		expect(onClickEmpty).not.toHaveBeenCalled();

		// When drag finishes completely
		isDragging = false;
		handlers.onclick(mockMouseEvent());
		expect(onClickEmpty).toHaveBeenCalledTimes(1);
	});
});
