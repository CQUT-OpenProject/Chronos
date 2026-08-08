import type { PreferencesRepository } from '../interfaces/preferences-repository';

export class SwitchTimetableUseCase {
	constructor(private readonly preferences: PreferencesRepository) {}

	async invoke(id: string): Promise<void> {
		await this.preferences.setCurrentTimetableId(id);
	}
}
