import type { Course } from '../../domain/course';
import type { EngineActionHost } from './engine-action-host';
import type { TimetableActions } from './timetable-actions';

/** Course mutations guarded by the event pipeline. */
export class CourseActions {
	constructor(
		private readonly host: EngineActionHost,
		private readonly timetables: TimetableActions
	) {}

	async saveCourse(course: Course): Promise<void> {
		if (!this.host.getCurrentTimetable()) {
			throw new Error('No active timetable to save course');
		}
		const allowed = await this.host.events.serial('guard:saveCourse', { course });
		if (!allowed) {
			throw new Error('[ChronosEngine] saveCourse action was rejected by guard');
		}

		return this.host.events.waterfall(
			'action:saveCourse',
			{ course },
			async ({ course: targetCourse }) => {
				const current = this.host.getCurrentTimetable()!;
				const courses = [...current.courses];
				const index = courses.findIndex((c) => c.id === targetCourse.id);
				if (index >= 0) {
					courses[index] = targetCourse;
				} else {
					courses.push(targetCourse);
				}

				await this.timetables.saveCurrentTimetableDetails({ courses });
			}
		);
	}

	async updateCourse(courseId: string, patch: Partial<Course>): Promise<void> {
		const current = this.host.getCurrentTimetable();
		if (!current) {
			throw new Error('No active timetable to update course');
		}

		const courses = current.courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c));
		await this.timetables.saveCurrentTimetableDetails({ courses });
	}

	async deleteCourse(courseId: string): Promise<void> {
		if (!this.host.getCurrentTimetable()) {
			throw new Error('No active timetable to delete course');
		}
		const allowed = await this.host.events.serial('guard:deleteCourse', { courseId });
		if (!allowed) {
			throw new Error('[ChronosEngine] deleteCourse action was rejected by guard');
		}

		return this.host.events.waterfall(
			'action:deleteCourse',
			{ courseId },
			async ({ courseId: targetId }) => {
				const courses = this.host.getCurrentTimetable()!.courses.filter((c) => c.id !== targetId);
				await this.timetables.saveCurrentTimetableDetails({ courses });
			}
		);
	}
}
