import type { TimetableRepository } from '../interfaces/timetable-repository';

export class SetDynamicColorEnabledUseCase {
	constructor(private readonly repository: TimetableRepository) {}

	async invoke(enabled: boolean): Promise<void> {
		await this.repository.setUseDynamicColor(enabled);
	}
}
