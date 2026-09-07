import { describe, expect, it, vi } from 'vite-plus/test';
import { createCourse } from '@chronos/core';
import { createGridGestureHandlers, GRID_GESTURE_DRAG_THRESHOLD_PX } from './grid-gesture';
import { createTimetableInteraction } from './timetable-interaction.svelte';

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

function createHarness() {
	const interaction = createTimetableInteraction({ longPressDelayMs: 400 });
	const onEmptyLongPress = vi.fn(() => {
		interaction.enterEdit();
	});
	const onClickEmpty = vi.fn(() => {
		interaction.exitEdit();
	});
	const handlers = createGridGestureHandlers({
		interaction,
		onEmptyLongPress,
		onClickEmpty
	});
	return { interaction, handlers, onEmptyLongPress, onClickEmpty };
}

describe('createGridGestureHandlers', () => {
	it('triggers onEmptyLongPress after delay and suppresses subsequent click', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onEmptyLongPress, onClickEmpty } = createHarness();

			const downEvt = mockPointerEvent({ clientX: 50, clientY: 50 });
			handlers.onpointerdown(downEvt);

			expect(onEmptyLongPress).not.toHaveBeenCalled();

			vi.advanceTimersByTime(400);
			expect(onEmptyLongPress).toHaveBeenCalledWith(downEvt);

			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));
			handlers.onclick(mockMouseEvent());
			expect(onClickEmpty).not.toHaveBeenCalled();

			handlers.onclick(mockMouseEvent());
			expect(onClickEmpty).toHaveBeenCalledTimes(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it('exits edit mode on the very first click after long press when no click was fired on pointerup (touch/mobile)', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onEmptyLongPress, onClickEmpty } = createHarness();

			const downEvt = mockPointerEvent({ clientX: 50, clientY: 50 });
			handlers.onpointerdown(downEvt);
			vi.advanceTimersByTime(400);
			expect(onEmptyLongPress).toHaveBeenCalledWith(downEvt);

			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));

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
			const { handlers, onEmptyLongPress, onClickEmpty } = createHarness();

			const downEvt = mockPointerEvent({ clientX: 50, clientY: 50 });
			handlers.onpointerdown(downEvt);
			vi.advanceTimersByTime(400);
			expect(onEmptyLongPress).toHaveBeenCalledWith(downEvt);

			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(60);

			handlers.onclick(mockMouseEvent());
			expect(onClickEmpty).toHaveBeenCalledTimes(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press when pointer moves beyond drag threshold', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onEmptyLongPress } = createHarness();

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(200);

			handlers.onpointermove(
				mockPointerEvent({
					clientX: 50 + GRID_GESTURE_DRAG_THRESHOLD_PX + 2,
					clientY: 50
				})
			);
			vi.advanceTimersByTime(300);

			expect(onEmptyLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press on pointerup before delay', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onEmptyLongPress } = createHarness();

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(200);
			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));

			vi.advanceTimersByTime(300);
			expect(onEmptyLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press on pointercancel or pointerleave', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onEmptyLongPress } = createHarness();

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(200);
			handlers.onpointercancel(mockPointerEvent({ clientX: 50, clientY: 50 }));

			vi.advanceTimersByTime(300);
			expect(onEmptyLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('ignores target that is inside a course-capsule', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onEmptyLongPress } = createHarness();

			const capsuleTarget = createMockElement('.course-capsule');
			handlers.onpointerdown(
				mockPointerEvent({
					target: capsuleTarget as unknown as EventTarget,
					clientX: 50,
					clientY: 50
				})
			);
			vi.advanceTimersByTime(500);

			expect(onEmptyLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('does not start long press timer when already in editing mode', () => {
		vi.useFakeTimers();
		try {
			const { interaction, handlers, onEmptyLongPress } = createHarness();
			interaction.enterEdit();

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(500);

			expect(onEmptyLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('does not exit edit mode when clicking on a button or capsule in edit mode', () => {
		const { interaction, handlers, onClickEmpty } = createHarness();
		interaction.enterEdit();

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
			const { handlers, onEmptyLongPress } = createHarness();

			handlers.onpointerdown(mockPointerEvent({ button: 2, clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(500);

			expect(onEmptyLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('suppresses click and does not exit edit mode while a drag click-guard is active', () => {
		let now = 1_000;
		const interaction = createTimetableInteraction({
			now: () => now,
			clickGuardMs: 120
		});
		const onClickEmpty = vi.fn(() => {
			interaction.exitEdit();
		});
		const handlers = createGridGestureHandlers({
			interaction,
			onClickEmpty
		});
		interaction.enterEdit();
		interaction.beginDrag({
			course: createCourse({
				id: 'course-1',
				name: '高等数学',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 2,
				weeks: [1]
			}),
			placed: {} as never,
			pointerId: 1,
			week: 1,
			targetColIndex: 0,
			targetDayOfWeek: 1,
			targetStartPeriod: 1,
			persistAfterDrop: true
		});

		handlers.onclick(mockMouseEvent());
		expect(onClickEmpty).not.toHaveBeenCalled();

		interaction.endDrag();
		handlers.onclick(mockMouseEvent());
		expect(onClickEmpty).not.toHaveBeenCalled();

		now = 1_120;
		handlers.onclick(mockMouseEvent());
		expect(onClickEmpty).toHaveBeenCalledTimes(1);
	});
});
