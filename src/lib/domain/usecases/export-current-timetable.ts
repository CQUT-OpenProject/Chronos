import type { TimetableRepository } from '../interfaces/timetable-repository';
import type { TimetableShareLinkCodec } from '../interfaces/timetable-share-link-codec';
import { success, type AppResult } from '../result/app-result';

export class ExportCurrentTimetableUseCase {
	constructor(
		private readonly repository: TimetableRepository,
		private readonly shareLinkCodec: TimetableShareLinkCodec
	) {}

	async invoke(): Promise<AppResult<string | null>> {
		const timetable = (await this.repository.getAppStateSnapshot()).currentTimetable;
		if (!timetable) return success(null);
		return await this.shareLinkCodec.encodeClipboardText(timetable);
	}
}
