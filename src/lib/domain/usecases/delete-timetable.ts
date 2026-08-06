import type { TimetableRepository } from '../interfaces/timetable-repository';

export class DeleteTimetableUseCase {
	constructor(private readonly repository: TimetableRepository) {}

	async invoke(id: string): Promise<void> {
		await this.repository.deleteTimetable(id);
		const nextTimetableId = (await this.repository.getAppStateSnapshot()).timetables[0]?.id ?? null;
		await this.repository.setCurrentTimetableId(nextTimetableId);
	}
}
