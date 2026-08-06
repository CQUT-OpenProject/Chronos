import { ThemeMode } from '$lib/models/app-state';
import type { TimetableRepository } from '../interfaces/timetable-repository';

export class SetThemeModeUseCase {
	constructor(private readonly repository: TimetableRepository) {}

	async invoke(mode: ThemeMode): Promise<void> {
		await this.repository.setThemeMode(mode);
	}
}
