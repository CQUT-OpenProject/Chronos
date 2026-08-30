import { describe, expect, it, vi } from 'vite-plus/test';
import { createCourse } from '@chronos/core';
import { COURSE_CARD_DRAG_THRESHOLD_PX, createCourseCardHandlers } from './course-card-gesture';

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

describe('createCourseCardHandlers', () => {
	it('triggers click callback on quick tap without movement', () => {
		const onCourseClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, { onCourseClick });

		handlers.onpointerdown(mockPointerEvent({ clientX: 10, clientY: 10 }));
		handlers.onpointerup(mockPointerEvent({ clientX: 10, clientY: 10 }));

		const clickEvent = mockMouseEvent();
		handlers.onclick(clickEvent);

		expect(onCourseClick).toHaveBeenCalledWith(sampleCourse);
	});

	it('suppresses click when pointer moves beyond drag threshold', () => {
		const onCourseClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, { onCourseClick });

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

		const clickEvent = mockMouseEvent();
		handlers.onclick(clickEvent);

		expect(onCourseClick).not.toHaveBeenCalled();
	});

	it('suppresses click when pointer moves vertically while scrolling', () => {
		const onCourseClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, { onCourseClick });

		handlers.onpointerdown(mockPointerEvent({ clientX: 50, clientY: 50 }));
		handlers.onpointermove(
			mockPointerEvent({
				clientX: 50,
				clientY: 50 + COURSE_CARD_DRAG_THRESHOLD_PX + 1
			})
		);
		handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 80 }));

		const clickEvent = mockMouseEvent();
		handlers.onclick(clickEvent);

		expect(onCourseClick).not.toHaveBeenCalled();
	});

	it('ignores non-primary pointer button presses', () => {
		const onCourseClick = vi.fn();
		const handlers = createCourseCardHandlers(sampleCourse, { onCourseClick });

		handlers.onpointerdown(mockPointerEvent({ button: 2, clientX: 50, clientY: 50 }));
		handlers.onpointerup(mockPointerEvent({ clientX: 50, clientY: 50 }));

		const clickEvent = mockMouseEvent();
		handlers.onclick(clickEvent);

		expect(onCourseClick).toHaveBeenCalledWith(sampleCourse);
	});
});
