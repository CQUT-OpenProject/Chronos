import type { TimetableRepository } from '../interfaces/timetable-repository';
import type { AppState } from '$lib/models/app-state';

export class ObserveAppStateUseCase {
	constructor(private readonly repository: TimetableRepository) {}

	subscribe(listener: (state: AppState) => void): () => void {
		return this.repository.subscribeAppState(listener);
	}
}
