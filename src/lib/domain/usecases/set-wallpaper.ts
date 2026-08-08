import type { PreferencesRepository } from '../interfaces/preferences-repository';

export class SetWallpaperUseCase {
	constructor(private readonly preferences: PreferencesRepository) {}

	async invoke(uri: string | null): Promise<void> {
		await this.preferences.setWallpaper(uri);
	}
}
