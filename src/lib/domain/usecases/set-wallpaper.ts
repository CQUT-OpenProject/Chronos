import type { TimetableRepository } from '../interfaces/timetable-repository';

export class SetWallpaperUseCase {
	constructor(private readonly repository: TimetableRepository) {}

	async invoke(uri: string | null): Promise<void> {
		await this.repository.setWallpaper(uri);
	}
}
