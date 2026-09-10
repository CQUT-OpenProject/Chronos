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

function createHarness() {
	const onLongPressFeedback = vi.fn();
	const interaction = createTimetableInteraction({
		longPressDelayMs: 400,
		onLongPressFeedback
	});
	const onClickEmpty = vi.fn(() => {
		interaction.exitEdit();
	});
	const handlers = createGridGestureHandlers({
		interaction,
		onClickEmpty
	});
	return { interaction, handlers, onLongPressFeedback, onClickEmpty };
}

describe('createGridGestureHandlers', () => {
	it('keeps edit after long press and exits only on a fresh empty pointer tap', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onLongPressFeedback, onClickEmpty, interaction } = createHarness();

			const downEvt = mockPointerEvent({ clientX: 50, clientY: 50 });
			handlers.onpointerdown(downEvt);

			expect(onLongPressFeedback).not.toHaveBeenCalled();
			expect(interaction.isEditing).toBe(false);

			vi.advanceTimersByTime(400);
			expect(onLongPressFeedback).toHaveBeenCalledTimes(1);
			expect(interaction.isEditing).toBe(true);

			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));
			expect(onClickEmpty).not.toHaveBeenCalled();
			expect(interaction.isEditing).toBe(true);

			handlers.onpointerdown(mockPointerEvent({ clientX: 100, clientY: 100 }));
			handlers.onpointerup(mockPointerEvent({ clientX: 100, clientY: 100 }));
			expect(onClickEmpty).toHaveBeenCalledTimes(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it('does not let time after pointerup affect the long-press outcome', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onLongPressFeedback, onClickEmpty, interaction } = createHarness();

			const downEvt = mockPointerEvent({ clientX: 50, clientY: 50 });
			handlers.onpointerdown(downEvt);
			vi.advanceTimersByTime(400);
			expect(onLongPressFeedback).toHaveBeenCalledTimes(1);

			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(60);

			expect(onClickEmpty).not.toHaveBeenCalled();
			expect(interaction.isEditing).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press when pointer moves beyond drag threshold', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onLongPressFeedback } = createHarness();

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(200);

			handlers.onpointermove(
				mockPointerEvent({
					clientX: 50 + GRID_GESTURE_DRAG_THRESHOLD_PX + 2,
					clientY: 50
				})
			);
			vi.advanceTimersByTime(300);

			expect(onLongPressFeedback).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press on pointerup before delay', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onLongPressFeedback } = createHarness();

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(200);
			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));

			vi.advanceTimersByTime(300);
			expect(onLongPressFeedback).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press on pointercancel or pointerleave', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onLongPressFeedback } = createHarness();

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(200);
			handlers.onpointercancel(mockPointerEvent({ clientX: 50, clientY: 50 }));

			vi.advanceTimersByTime(300);
			expect(onLongPressFeedback).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('ignores target that is inside a course-capsule', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onLongPressFeedback } = createHarness();

			const capsuleTarget = createMockElement('.course-capsule');
			handlers.onpointerdown(
				mockPointerEvent({
					target: capsuleTarget as unknown as EventTarget,
					clientX: 50,
					clientY: 50
				})
			);
			vi.advanceTimersByTime(500);

			expect(onLongPressFeedback).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('records an empty tap without starting a long press when already editing', () => {
		vi.useFakeTimers();
		try {
			const { interaction, handlers, onLongPressFeedback } = createHarness();
			interaction.enterEdit();

			handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(500);

			expect(onLongPressFeedback).not.toHaveBeenCalled();
			handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));
		} finally {
			vi.useRealTimers();
		}
	});

	it('does not exit edit mode for a pointer tap on a button or capsule', () => {
		const { interaction, handlers, onClickEmpty } = createHarness();
		interaction.enterEdit();

		const buttonTarget = createMockElement('button');
		handlers.onpointerdown(mockPointerEvent({ target: buttonTarget as unknown as EventTarget }));
		handlers.onpointerup(mockPointerEvent({ target: buttonTarget as unknown as EventTarget }));
		expect(onClickEmpty).not.toHaveBeenCalled();

		const capsuleTarget = createMockElement('.course-capsule');
		handlers.onpointerdown(mockPointerEvent({ target: capsuleTarget as unknown as EventTarget }));
		handlers.onpointerup(mockPointerEvent({ target: capsuleTarget as unknown as EventTarget }));
		expect(onClickEmpty).not.toHaveBeenCalled();
	});

	it('ignores non-primary pointer button', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onLongPressFeedback } = createHarness();

			handlers.onpointerdown(mockPointerEvent({ button: 2, clientX: 50, clientY: 50 }));
			vi.advanceTimersByTime(500);

			expect(onLongPressFeedback).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('does not start an empty-tap session while a drag click guard is active', () => {
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

		handlers.onpointerdown(mockPointerEvent());
		handlers.onpointerup(mockPointerEvent());
		expect(onClickEmpty).not.toHaveBeenCalled();

		interaction.endDrag();
		handlers.onpointerdown(mockPointerEvent());
		handlers.onpointerup(mockPointerEvent());
		expect(onClickEmpty).not.toHaveBeenCalled();

		now = 1_120;
		handlers.onpointerdown(mockPointerEvent());
		handlers.onpointerup(mockPointerEvent());
		expect(onClickEmpty).toHaveBeenCalledTimes(1);
	});
});
