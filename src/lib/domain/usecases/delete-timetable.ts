import type { PreferencesRepository } from '../interfaces/preferences-repository';
import type { TimetableRepository } from '../interfaces/timetable-repository';

export class DeleteTimetableUseCase {
	constructor(
		private readonly repository: TimetableRepository,
		private readonly preferences: PreferencesRepository
	) {}

	async invoke(id: string): Promise<void> {
		const currentSnapshot = await this.repository.getAppStateSnapshot();
		const isDeletingActive = currentSnapshot.currentTimetableId === id;

		await this.repository.deleteTimetable(id);

		if (isDeletingActive) {
			const updatedSnapshot = await this.repository.getAppStateSnapshot();
			const nextTimetableId = updatedSnapshot.timetables[0]?.id ?? null;
			await this.preferences.setCurrentTimetableId(nextTimetableId);
		}
	}
}
