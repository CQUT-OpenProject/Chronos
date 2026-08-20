import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { createCourse } from '@chronos/core';
import {
	COURSE_CARD_DRAG_THRESHOLD_PX,
	COURSE_CARD_LONG_PRESS_DELAY_MS,
	createCourseCardHandlers
} from './course-card-gesture';

const sampleCourse = createCourse({
	id: 'course-1',
	name: 'Advanced Programming',
	teacher: 'Dr. Smith',
	location: 'Building A 101',
	startPeriod: 1,
	endPeriod: 2,
	dayOfWeek: 1,
	color: '#123456',
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

function mockKeyboardEvent(init: Partial<KeyboardEvent> = {}): KeyboardEvent {
	return {
		key: 'Enter',
		shiftKey: false,
		preventDefault: () => {},
		...init
	} as unknown as KeyboardEvent;
}

describe('createCourseCardHandlers', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('triggers click callback on quick tap without movement', () => {
		const onCourseClick = vi.fn();
		const onCourseLongClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseClick,
			onCourseLongClick
		});

		handlers.onpointerdown(mockPointerEvent({ clientX: 10, clientY: 10 }));
		vi.advanceTimersByTime(100);
		handlers.onpointerup(mockPointerEvent({ clientX: 10, clientY: 10 }));

		const clickEvent = mockMouseEvent();
		handlers.onclick(clickEvent);

		expect(onCourseClick).toHaveBeenCalledWith(sampleCourse);
		expect(onCourseLongClick).not.toHaveBeenCalled();
	});

	it('triggers long press callback when pointer remains stationary for longPressDelayMs', () => {
		const onCourseClick = vi.fn();
		const onCourseLongClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseClick,
			onCourseLongClick
		});

		handlers.onpointerdown(mockPointerEvent({ clientX: 100, clientY: 100 }));
		vi.advanceTimersByTime(COURSE_CARD_LONG_PRESS_DELAY_MS);

		expect(onCourseLongClick).toHaveBeenCalledWith(sampleCourse);

		handlers.onpointerup(mockPointerEvent({ clientX: 100, clientY: 100 }));

		const clickEvent = mockMouseEvent();
		handlers.onclick(clickEvent);

		expect(onCourseClick).not.toHaveBeenCalled();
	});

	it('cancels long press and suppresses click when pointer moves beyond drag threshold (slow swipe / drag)', () => {
		const onCourseClick = vi.fn();
		const onCourseLongClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseClick,
			onCourseLongClick
		});

		// User puts finger on course card
		handlers.onpointerdown(mockPointerEvent({ clientX: 100, clientY: 100 }));

		// User starts sliding slowly horizontally
		handlers.onpointermove(
			mockPointerEvent({
				clientX: 100 + COURSE_CARD_DRAG_THRESHOLD_PX + 5,
				clientY: 100
			})
		);

		// Swipe takes longer than long press delay
		vi.advanceTimersByTime(COURSE_CARD_LONG_PRESS_DELAY_MS + 200);

		// Long press must NOT have fired
		expect(onCourseLongClick).not.toHaveBeenCalled();

		// User releases finger
		handlers.onpointerup(
			mockPointerEvent({
				clientX: 200,
				clientY: 100
			})
		);

		// Subsequent click event from drag release should be suppressed
		const clickEvent = mockMouseEvent();
		handlers.onclick(clickEvent);

		expect(onCourseClick).not.toHaveBeenCalled();
	});

	it('cancels long press when pointer moves vertically (scrolling)', () => {
		const onCourseClick = vi.fn();
		const onCourseLongClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseClick,
			onCourseLongClick
		});

		handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
		handlers.onpointermove(
			mockPointerEvent({
				clientX: 50,
				clientY: 50 + COURSE_CARD_DRAG_THRESHOLD_PX + 1
			})
		);

		vi.advanceTimersByTime(COURSE_CARD_LONG_PRESS_DELAY_MS + 100);
		expect(onCourseLongClick).not.toHaveBeenCalled();
	});

	it('allows long press if pointer movement is within the jitter threshold', () => {
		const onCourseClick = vi.fn();
		const onCourseLongClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseClick,
			onCourseLongClick
		});

		handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
		handlers.onpointermove(
			mockPointerEvent({
				clientX: 50 + COURSE_CARD_DRAG_THRESHOLD_PX - 2,
				clientY: 50 + COURSE_CARD_DRAG_THRESHOLD_PX - 2
			})
		);

		vi.advanceTimersByTime(COURSE_CARD_LONG_PRESS_DELAY_MS);
		expect(onCourseLongClick).toHaveBeenCalledWith(sampleCourse);
	});

	it('cancels long press on pointer leave', () => {
		const onCourseLongClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseLongClick
		});

		handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
		handlers.onpointerleave(mockPointerEvent());

		vi.advanceTimersByTime(COURSE_CARD_LONG_PRESS_DELAY_MS);
		expect(onCourseLongClick).not.toHaveBeenCalled();
	});

	it('cancels long press on pointer cancel', () => {
		const onCourseLongClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseLongClick
		});

		handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
		handlers.onpointercancel(mockPointerEvent());

		vi.advanceTimersByTime(COURSE_CARD_LONG_PRESS_DELAY_MS);
		expect(onCourseLongClick).not.toHaveBeenCalled();
	});

	it('triggers long click on contextmenu event', () => {
		const onCourseLongClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseLongClick
		});

		const preventDefault = vi.fn();
		const contextMenuEvent = mockMouseEvent({ preventDefault });
		handlers.oncontextmenu(contextMenuEvent);

		expect(preventDefault).toHaveBeenCalled();
		expect(onCourseLongClick).toHaveBeenCalledWith(sampleCourse);
	});

	it('triggers long click on Shift + Enter keydown', () => {
		const onCourseLongClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseLongClick
		});

		const preventDefault = vi.fn();
		const keyEvent = mockKeyboardEvent({ key: 'Enter', shiftKey: true, preventDefault });
		handlers.onkeydown(keyEvent);

		expect(preventDefault).toHaveBeenCalled();
		expect(onCourseLongClick).toHaveBeenCalledWith(sampleCourse);
	});

	it('does not trigger long press if non-primary mouse button is pressed', () => {
		const onCourseLongClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseLongClick
		});

		handlers.onpointerdown(mockPointerEvent({ button: 2, clientX: 50, clientY: 50 }));

		vi.advanceTimersByTime(COURSE_CARD_LONG_PRESS_DELAY_MS);
		expect(onCourseLongClick).not.toHaveBeenCalled();
	});

	it('calls custom onLongPressFeedback when provided', () => {
		const onCourseLongClick = vi.fn();
		const onLongPressFeedback = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, {
			onCourseLongClick,
			onLongPressFeedback
		});

		handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
		vi.advanceTimersByTime(COURSE_CARD_LONG_PRESS_DELAY_MS);

		expect(onLongPressFeedback).toHaveBeenCalledOnce();
		expect(onCourseLongClick).toHaveBeenCalledWith(sampleCourse);
	});
});
