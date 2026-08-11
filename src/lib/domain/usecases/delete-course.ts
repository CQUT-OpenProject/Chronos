import type { TimetableRepository } from '../interfaces/timetable-repository';

export class DeleteCourseUseCase {
	constructor(private readonly repository: TimetableRepository) {}

	async invoke(courseId: string): Promise<void> {
		await this.repository.deleteCourse(courseId);
	}
}
