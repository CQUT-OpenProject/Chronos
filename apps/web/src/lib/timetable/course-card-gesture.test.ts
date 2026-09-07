import { describe, expect, it, vi } from 'vite-plus/test';
import { createCourse, type Course } from '@chronos/core';
import { COURSE_CARD_DRAG_THRESHOLD_PX, createCourseCardHandlers } from './course-card-gesture';
import { createTimetableInteraction } from './timetable-interaction.svelte';

const sampleCourse = createCourse({
	id: 'course-1',
	name: 'Advanced Programming',
	teacher: 'Dr. Smith',
	location: 'Building A 101',
	startPeriod: 1,
	endPeriod: 2,
	dayOfWeek: 1,
	weeks: [1, 2, 3, 4]
});

function mockPointerEvent(init: Partial<PointerEvent> = {}): PointerEvent {
	return {
		button: 0,
		pointerId: 1,
		clientX: 0,
		clientY: 0,
		preventDefault: () => {},
		...init
	} as unknown as PointerEvent;
}

function mockMouseEvent(init: Partial<MouseEvent> = {}): MouseEvent {
	return {
		button: 0,
		preventDefault: () => {},
		...init
	} as unknown as MouseEvent;
}

function createHarness() {
	const interaction = createTimetableInteraction({ longPressDelayMs: 400 });
	const onCourseClick = vi.fn<(course: Course) => void>();
	const onLongPress = vi.fn<(course: Course, event: PointerEvent) => void>();
	const onDragStart = vi.fn<(course: Course, event: PointerEvent) => void>();
	const handlers = createCourseCardHandlers(sampleCourse, {
		interaction,
		onCourseClick,
		onLongPress,
		onDragStart
	});
	return { interaction, handlers, onCourseClick, onLongPress, onDragStart };
}

describe('createCourseCardHandlers', () => {
	it('triggers click callback on quick tap without movement', () => {
		const { handlers, onCourseClick } = createHarness();

		handlers.onpointerdown(mockPointerEvent({ clientX: 10, clientY: 10 }));
		handlers.onpointerup(mockPointerEvent({ clientX: 10, clientY: 10 }));

		handlers.onclick(mockMouseEvent());

		expect(onCourseClick).toHaveBeenCalledWith(sampleCourse);
	});

	it('suppresses click when pointer moves beyond drag threshold', () => {
		const { handlers, onCourseClick } = createHarness();

		handlers.onpointerdown(mockPointerEvent({ clientX: 100, clientY: 100 }));
		handlers.onpointermove(
			mockPointerEvent({
				clientX: 100 + COURSE_CARD_DRAG_THRESHOLD_PX + 5,
				clientY: 100
			})
		);
		handlers.onpointerup(
			mockPointerEvent({
				clientX: 200,
				clientY: 100
			})
		);

		handlers.onclick(mockMouseEvent());

		expect(onCourseClick).not.toHaveBeenCalled();
	});

	it('suppresses click when pointer moves vertically while scrolling', () => {
		const { handlers, onCourseClick } = createHarness();

		handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
		handlers.onpointermove(
			mockPointerEvent({
				clientX: 50,
				clientY: 50 + COURSE_CARD_DRAG_THRESHOLD_PX + 1
			})
		);
		handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 80 }));

		handlers.onclick(mockMouseEvent());

		expect(onCourseClick).not.toHaveBeenCalled();
	});

	it('ignores non-primary pointer button presses', () => {
		const { handlers, onCourseClick } = createHarness();

		handlers.onpointerdown(mockPointerEvent({ button: 2, clientX: 50, clientY: 50 }));
		handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));

		handlers.onclick(mockMouseEvent());

		expect(onCourseClick).toHaveBeenCalledWith(sampleCourse);
	});

	it('triggers onLongPress after delay and suppresses subsequent click', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onLongPress, onCourseClick } = createHarness();

			const downEvt = mockPointerEvent({ clientX: 30, clientY: 30 });
			handlers.onpointerdown(downEvt);

			expect(onLongPress).not.toHaveBeenCalled();

			vi.advanceTimersByTime(400);
			expect(onLongPress).toHaveBeenCalledWith(sampleCourse, downEvt);

			handlers.onpointerup(mockPointerEvent({ clientX: 30, clientY: 30 }));
			handlers.onclick(mockMouseEvent());

			expect(onCourseClick).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('cancels long press if pointer moves beyond threshold before timeout', () => {
		vi.useFakeTimers();
		try {
			const { handlers, onLongPress } = createHarness();

			handlers.onpointerdown(mockPointerEvent({ clientX: 30, clientY: 30 }));
			vi.advanceTimersByTime(200);

			handlers.onpointermove(
				mockPointerEvent({
					clientX: 30 + COURSE_CARD_DRAG_THRESHOLD_PX + 2,
					clientY: 30
				})
			);
			vi.advanceTimersByTime(300);

			expect(onLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	it('triggers onDragStart immediately if already in edit mode', () => {
		const { interaction, handlers, onDragStart, onCourseClick } = createHarness();
		interaction.enterEdit();

		const downEvt = mockPointerEvent({ clientX: 30, clientY: 30 });
		handlers.onpointerdown(downEvt);

		expect(onDragStart).toHaveBeenCalledWith(sampleCourse, downEvt);

		handlers.onclick(mockMouseEvent());
		expect(onCourseClick).not.toHaveBeenCalled();
	});

	it('suppresses click when interaction is click-guarded after drag end', () => {
		const { interaction, handlers, onCourseClick } = createHarness();
		const fakePlaced = {
			kind: 'course' as const,
			key: sampleCourse.id,
			course: sampleCourse,
			displayModel: { course: sampleCourse, isInDisplayedWeek: true },
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

		interaction.beginDrag({
			course: sampleCourse,
			placed: fakePlaced,
			pointerId: 1,
			week: 1,
			targetColIndex: 0,
			targetDayOfWeek: 1,
			targetStartPeriod: 1,
			persistAfterDrop: false
		});
		interaction.endDrag();

		expect(interaction.isClickGuarded()).toBe(true);

		const clickEvt = mockMouseEvent();
		const preventDefaultSpy = vi.spyOn(clickEvt, 'preventDefault');

		handlers.onclick(clickEvt);

		expect(preventDefaultSpy).toHaveBeenCalled();
		expect(onCourseClick).not.toHaveBeenCalled();
	});

	it('ignores pointerdown while interaction is click-guarded', () => {
		vi.useFakeTimers();
		try {
			const { interaction, handlers, onLongPress } = createHarness();
			const fakePlaced = {
				kind: 'course' as const,
				key: sampleCourse.id,
				course: sampleCourse,
				displayModel: { course: sampleCourse, isInDisplayedWeek: true },
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

			interaction.beginDrag({
				course: sampleCourse,
				placed: fakePlaced,
				pointerId: 1,
				week: 1,
				targetColIndex: 0,
				targetDayOfWeek: 1,
				targetStartPeriod: 1,
				persistAfterDrop: false
			});
			interaction.endDrag();
			expect(interaction.isClickGuarded()).toBe(true);

			handlers.onpointerdown(mockPointerEvent({ clientX: 30, clientY: 30 }));
			vi.advanceTimersByTime(500);

			expect(onLongPress).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});
});
