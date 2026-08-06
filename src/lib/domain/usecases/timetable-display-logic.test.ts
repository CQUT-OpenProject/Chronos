import { describe, expect, it } from 'vite-plus/test';
import { createCourse } from '$lib/models/course';
import { createTimetable } from '$lib/models/timetable';
import { BuildTimetableCourseDisplayModelsUseCase } from './build-timetable-course-display-models';

describe('BuildTimetableCourseDisplayModelsUseCase', () => {
	const useCase = new BuildTimetableCourseDisplayModelsUseCase();

	it('keeps current displayed week courses and excludes ended courses from non current section', () => {
		const models = useCase.invoke(
			sampleTimetable({
				courses: [
					sampleCourse('current', [8]),
					sampleCourse('ended', [1, 2, 3]),
					sampleCourse('future', [9], 3, 4)
				]
			}),
			new Set([1]),
			8,
			'2026-04-20'
		);

		expect(models.map((model) => model.course.id)).toEqual(['current', 'future']);
		expect(models.find((model) => model.course.id === 'current')?.isInDisplayedWeek).toBe(true);
		expect(models.find((model) => model.course.id === 'future')?.isInDisplayedWeek).toBe(false);
	});

	it('disables future placeholders when setting is off', () => {
		const models = useCase.invoke(
			sampleTimetable({
				showNonCurrentWeekCourses: false,
				courses: [sampleCourse('current', [8]), sampleCourse('future', [9])]
			}),
			new Set([1]),
			8,
			'2026-04-20'
		);

		expect(models.map((model) => model.course.id)).toEqual(['current']);
	});

	it('includes all-week courses in the current section', () => {
		const models = useCase.invoke(
			sampleTimetable({
				courses: [sampleCourse('all-weeks', [])]
			}),
			new Set([1]),
			8,
			'2026-04-20'
		);

		expect(models).toHaveLength(1);
		expect(models[0]?.course.id).toBe('all-weeks');
		expect(models[0]?.isInDisplayedWeek).toBe(true);
	});
});

function sampleTimetable(options: {
	showNonCurrentWeekCourses?: boolean;
	courses: ReturnType<typeof sampleCourse>[];
}) {
	return createTimetable({
		id: 'timetable',
		name: '课表',
		courses: options.courses,
		createdAt: 0,
		updatedAt: 0,
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		},
		viewPrefs: {
			showSaturday: true,
			showSunday: true,
			showNonCurrentWeekCourses: options.showNonCurrentWeekCourses ?? true
		}
	});
}

function sampleCourse(id: string, weeks: number[], startPeriod = 1, endPeriod = 2) {
	return createCourse({
		id,
		name: id,
		teacher: '老师',
		location: 'A101',
		dayOfWeek: 1,
		startPeriod,
		endPeriod,
		color: '#EADDFF',
		textColor: '#21005D',
		weeks
	});
}
