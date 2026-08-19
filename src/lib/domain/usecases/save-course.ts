import { COURSE_REMARK_MAX_LENGTH, createCourse } from '@chronos/core';
import type { CourseDraft } from '$lib/models/drafts';
import type { TimetableRepository } from '../interfaces/timetable-repository';

export class SaveCourseUseCase {
	constructor(private readonly repository: TimetableRepository) {}

	async invoke(timetableId: string, draft: CourseDraft): Promise<void> {
		await this.repository.saveCourse(
			timetableId,
			createCourse({
				id: draft.id ?? crypto.randomUUID(),
				name: draft.name.trim(),
				teacher: draft.teacher.trim(),
				location: draft.location.trim(),
				dayOfWeek: draft.dayOfWeek,
				startPeriod: draft.startPeriod,
				endPeriod: Math.max(draft.endPeriod, draft.startPeriod),
				color: draft.color,
				textColor: draft.textColor,
				weeks: draft.weeks,
				remark: draft.remark.trim().slice(0, COURSE_REMARK_MAX_LENGTH)
			})
		);
	}
}
