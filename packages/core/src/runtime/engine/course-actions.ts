import type { Course } from '../../domain/course';
import type { EngineActionHost } from './engine-action-host';
import type { TimetableActions } from './timetable-actions';

/** Course mutations for ChronosEngine. */
export class CourseActions {
	constructor(
		private readonly host: EngineActionHost,
		private readonly timetables: TimetableActions
	) {}

	async saveCourse(course: Course): Promise<void> {
		const current = this.host.getCurrentTimetable();
		if (!current) {
			throw new Error('No active timetable to save course');
		}

		const courses = [...current.courses];
		const index = courses.findIndex((c) => c.id === course.id);
		if (index >= 0) {
			courses[index] = course;
		} else {
			courses.push(course);
		}

		await this.timetables.saveCurrentTimetableDetails({ courses });
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
		const current = this.host.getCurrentTimetable();
		if (!current) {
			throw new Error('No active timetable to delete course');
		}

		const courses = current.courses.filter((c) => c.id !== courseId);
		await this.timetables.saveCurrentTimetableDetails({ courses });
	}
}
