import type { TimetableRepository } from '../interfaces/timetable-repository';

export class SwitchTimetableUseCase {
	constructor(private readonly repository: TimetableRepository) {}

	async invoke(id: string): Promise<void> {
		await this.repository.setCurrentTimetableId(id);
	}
}
