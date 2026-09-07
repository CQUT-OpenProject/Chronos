import { describe, expect, it, vi } from 'vite-plus/test';
import { createCourse } from '@chronos/core';
import type { PlacedCourseCapsule } from '@chronos/core';
import {
	TIMETABLE_LONG_PRESS_DELAY_MS,
	TIMETABLE_POINTER_THRESHOLD_PX,
	createTimetableInteraction
} from './timetable-interaction.svelte';

const sampleCourse = createCourse({
	id: 'course-1',
	name: '高等数学',
	dayOfWeek: 1,
	startPeriod: 1,
	endPeriod: 2,
	weeks: [1, 2]
});

function fakePlaced(course = sampleCourse): PlacedCourseCapsule {
	return {
		kind: 'course',
		key: course.id,
		course,
		displayModel: { course, isInDisplayedWeek: true },
		geometry: { leftPercent: 0, widthPercent: 20, startPeriod: 1, endPeriod: 2 },
		colors: { background: '#000', text: '#fff' },
		scale: { titlePx: 12, detailPx: 10, badgePx: 8, placeholderPx: 10 },
		locationLines: [],
		locationMetrics: { fontPx: 10, heightPx: 12 },
		teacher: '',
		badgeLabel: null,
		overlapCount: 1,
		corners: { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true }
	};
}

function dragInput(
	overrides: Partial<Parameters<ReturnType<typeof createTimetableInteraction>['beginDrag']>[0]> = {}
) {
	const placed = fakePlaced();
	return {
		course: placed.course,
		placed,
		pointerId: 1,
		week: 2,
		targetColIndex: 0,
		targetDayOfWeek: 1,
		targetStartPeriod: 1,
		persistAfterDrop: false,
		...overrides
	};
}

function mockPointerEvent(init: Partial<PointerEvent> = {}): PointerEvent {
	return {
		button: 0,
		pointerId: 1,
		clientX: 0,
		clientY: 0,
		preventDefault: () => {},
		stopPropagation: () => {},
		...init
	} as unknown as PointerEvent;
}

describe('createTimetableInteraction', () => {
	it('derives isEditing and allowPagerTouch from mode', () => {
		const interaction = createTimetableInteraction();
		expect(interaction.mode).toBe('view');
		expect(interaction.isEditing).toBe(false);
		expect(interaction.allowPagerTouch).toBe(true);

		interaction.enterEdit();
		expect(interaction.mode).toBe('edit');
		expect(interaction.isEditing).toBe(true);
		expect(interaction.allowPagerTouch).toBe(false);

		interaction.exitEdit();
		expect(interaction.mode).toBe('view');
		expect(interaction.allowPagerTouch).toBe(true);
	});

	it('toggles between view and edit and exits dragging to view', () => {
		const interaction = createTimetableInteraction();
		interaction.toggleEditing();
		expect(interaction.mode).toBe('edit');
		interaction.toggleEditing();
		expect(interaction.mode).toBe('view');

		interaction.beginDrag(dragInput({ persistAfterDrop: true }));
		expect(interaction.mode).toBe('dragging');
		interaction.toggleEditing();
		expect(interaction.mode).toBe('view');
		expect(interaction.drag).toBeNull();
	});

	it('returns to view after a transient drag and stays in edit after a persistent drag', () => {
		const transient = createTimetableInteraction();
		expect(transient.beginDrag(dragInput({ persistAfterDrop: false }))).toBe(true);
		expect(transient.isDragging).toBe(true);
		expect(transient.isEditing).toBe(true);
		expect(transient.allowPagerTouch).toBe(false);

		const ended = transient.endDrag();
		expect(ended?.persistAfterDrop).toBe(false);
		expect(transient.mode).toBe('view');
		expect(transient.drag).toBeNull();

		const persistent = createTimetableInteraction();
		persistent.enterEdit();
		persistent.beginDrag(dragInput({ persistAfterDrop: true }));
		expect(persistent.endDrag()?.persistAfterDrop).toBe(true);
		expect(persistent.mode).toBe('edit');
		expect(persistent.isEditing).toBe(true);
	});

	it('cancelDrag follows persistAfterDrop the same way as endDrag', () => {
		const transient = createTimetableInteraction();
		transient.beginDrag(dragInput({ persistAfterDrop: false }));
		transient.cancelDrag();
		expect(transient.mode).toBe('view');

		const persistent = createTimetableInteraction();
		persistent.enterEdit();
		persistent.beginDrag(dragInput({ persistAfterDrop: true }));
		persistent.cancelDrag();
		expect(persistent.mode).toBe('edit');
	});

	it('rejects a second drag while already dragging', () => {
		const interaction = createTimetableInteraction();
		expect(interaction.beginDrag(dragInput())).toBe(true);
		expect(interaction.beginDrag(dragInput({ pointerId: 2 }))).toBe(false);
		expect(interaction.drag?.pointerId).toBe(1);
	});

	it('updates drag targets and ignores no-op patches', () => {
		const interaction = createTimetableInteraction();
		interaction.beginDrag(dragInput());
		expect(
			interaction.updateDragTarget({
				targetColIndex: 2,
				targetDayOfWeek: 3,
				targetStartPeriod: 4
			})
		).toBe(true);
		expect(interaction.drag?.targetColIndex).toBe(2);
		expect(interaction.drag?.targetStartPeriod).toBe(4);
		expect(
			interaction.updateDragTarget({
				targetColIndex: 2,
				targetDayOfWeek: 3,
				targetStartPeriod: 4
			})
		).toBe(false);
	});

	it('exitEdit clears an in-flight drag', () => {
		const interaction = createTimetableInteraction();
		interaction.beginDrag(dragInput({ persistAfterDrop: true }));
		interaction.exitEdit();
		expect(interaction.mode).toBe('view');
		expect(interaction.drag).toBeNull();
	});

	it('fires long press only when held still past the delay', () => {
		vi.useFakeTimers();
		try {
			const interaction = createTimetableInteraction();
			const onFire = vi.fn();
			interaction.watchLongPress(mockPointerEvent({ clientX: 10, clientY: 10 }), onFire);
			vi.advanceTimersByTime(TIMETABLE_LONG_PRESS_DELAY_MS - 1);
			expect(onFire).not.toHaveBeenCalled();
			vi.advanceTimersByTime(1);
			expect(onFire).toHaveBeenCalledTimes(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press when movement exceeds the shared threshold', () => {
		vi.useFakeTimers();
		try {
			const interaction = createTimetableInteraction();
			const onFire = vi.fn();
			interaction.watchLongPress(mockPointerEvent({ clientX: 10, clientY: 10 }), onFire);
			interaction.notePointerMove(
				mockPointerEvent({
					clientX: 10 + TIMETABLE_POINTER_THRESHOLD_PX + 1,
					clientY: 10
				})
			);
			vi.advanceTimersByTime(TIMETABLE_LONG_PRESS_DELAY_MS + 50);
			expect(onFire).not.toHaveBeenCalled();
			expect(interaction.hasMoved).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});

	it('treats pager first move as the same cancel as exceeding the threshold', () => {
		vi.useFakeTimers();
		try {
			const interaction = createTimetableInteraction();
			const onFire = vi.fn();
			interaction.watchLongPress(mockPointerEvent({ clientX: 10, clientY: 10 }), onFire);
			interaction.notePagerFirstMove();
			vi.advanceTimersByTime(TIMETABLE_LONG_PRESS_DELAY_MS + 50);
			expect(onFire).not.toHaveBeenCalled();
			expect(interaction.hasMoved).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});

	it('does not start a long-press watch while editing or dragging', () => {
		vi.useFakeTimers();
		try {
			const editing = createTimetableInteraction();
			editing.enterEdit();
			const onFire = vi.fn();
			expect(editing.watchLongPress(mockPointerEvent(), onFire)).toBe(false);
			vi.advanceTimersByTime(TIMETABLE_LONG_PRESS_DELAY_MS + 50);
			expect(onFire).not.toHaveBeenCalled();

			const dragging = createTimetableInteraction();
			dragging.beginDrag(dragInput());
			expect(dragging.watchLongPress(mockPointerEvent(), onFire)).toBe(false);
		} finally {
			vi.useRealTimers();
		}
	});

	it('guards clicks after drag end', () => {
		let now = 1_000;
		const interaction = createTimetableInteraction({
			now: () => now,
			clickGuardMs: 120
		});
		interaction.beginDrag(dragInput());
		interaction.endDrag();
		expect(interaction.isClickGuarded()).toBe(true);
		now = 1_119;
		expect(interaction.isClickGuarded()).toBe(true);
		now = 1_120;
		expect(interaction.isClickGuarded()).toBe(false);
	});
});
