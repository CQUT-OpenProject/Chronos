import type { TimetableRepository } from '../interfaces/timetable-repository';
import type { TimetableShareCodec } from '../interfaces/timetable-share-codec';
import { success, type AppResult } from '../result/app-result';

export class ExportCurrentTimetableUseCase {
	constructor(
		private readonly repository: TimetableRepository,
		private readonly timetableShareCodec: TimetableShareCodec
	) {}

	async invoke(): Promise<AppResult<string | null>> {
		const timetable = (await this.repository.getAppStateSnapshot()).currentTimetable;
		if (!timetable) return success(null);
		return this.timetableShareCodec.encode(timetable);
	}
}
