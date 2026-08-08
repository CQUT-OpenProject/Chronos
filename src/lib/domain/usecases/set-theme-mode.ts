import { ThemeMode } from '$lib/models/app-state';
import type { PreferencesRepository } from '../interfaces/preferences-repository';

export class SetThemeModeUseCase {
	constructor(private readonly preferences: PreferencesRepository) {}

	async invoke(mode: ThemeMode): Promise<void> {
		await this.preferences.setThemeMode(mode);
	}
}
