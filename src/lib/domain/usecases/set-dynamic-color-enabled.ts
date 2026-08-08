import type { PreferencesRepository } from '../interfaces/preferences-repository';

export class SetDynamicColorEnabledUseCase {
	constructor(private readonly preferences: PreferencesRepository) {}

	async invoke(enabled: boolean): Promise<void> {
		await this.preferences.setUseDynamicColor(enabled);
	}
}
