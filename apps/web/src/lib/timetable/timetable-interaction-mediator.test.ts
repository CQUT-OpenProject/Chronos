import { describe, expect, it, vi } from 'vite-plus/test';
import { createCourse } from '@chronos/core';
import { createTimetableInteractionMediator } from './timetable-interaction-mediator';

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

describe('createTimetableInteractionMediator', () => {
	it('dispatches course click without triggering heavy haptic', () => {
		const onCourseClick = vi.fn();
		const onCourseLongClick = vi.fn();
		const mockHaptic = {
			heavy: vi.fn(),
			medium: vi.fn(),
			light: vi.fn()
		};
		const mockTelemetry = {
			track: vi.fn()
		};

		const mediator = createTimetableInteractionMediator({
			onCourseClick,
			onCourseLongClick,
			hapticPort: mockHaptic,
			telemetryPort: mockTelemetry
		});

		mediator.handleCourseClick(sampleCourse);

		expect(onCourseClick).toHaveBeenCalledWith(sampleCourse);
		expect(mockHaptic.heavy).not.toHaveBeenCalled();
	});

	it('triggers heavy haptic feedback on course long press', () => {
		const onCourseClick = vi.fn();
		const onCourseLongClick = vi.fn();
		const mockHaptic = {
			heavy: vi.fn(),
			medium: vi.fn(),
			light: vi.fn()
		};
		const mockTelemetry = {
			track: vi.fn()
		};

		const mediator = createTimetableInteractionMediator({
			onCourseClick,
			onCourseLongClick,
			hapticPort: mockHaptic,
			telemetryPort: mockTelemetry
		});

		mediator.handleCourseLongPress(sampleCourse);

		expect(mockHaptic.heavy).toHaveBeenCalledOnce();
		expect(onCourseLongClick).toHaveBeenCalledWith(sampleCourse);
	});

	it('tracks telemetry when expanding overlapped timetable slot', () => {
		const mockTelemetry = {
			track: vi.fn()
		};

		const mediator = createTimetableInteractionMediator({
			telemetryPort: mockTelemetry
		});

		mediator.handleOverlapExpand('slot-1-1-2');
		expect(mockTelemetry.track).toHaveBeenCalledWith('timetable_overlap_expand');
	});
});
