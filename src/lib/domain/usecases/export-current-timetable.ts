import type { TimetableRepository } from '../interfaces/timetable-repository';
import type { TimetableShareLinkCodec } from '../interfaces/timetable-share-link-codec';
import { SHARE_LINK_WARNING_LENGTH } from '$lib/parsers/share-link/chronos-share-link-codec';
import { success, type AppResult } from '../result/app-result';

export interface ExportMetadata {
	timetableName: string | null;
	longLinkWarning: boolean;
}

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

	async getExportMetadata(): Promise<ExportMetadata> {
		const timetable = (await this.repository.getAppStateSnapshot()).currentTimetable;
		if (!timetable) {
			return { timetableName: null, longLinkWarning: false };
		}
		const payloadLength = await this.shareLinkCodec.estimatePayloadLength(timetable);
		return {
			timetableName: timetable.name,
			longLinkWarning: payloadLength > SHARE_LINK_WARNING_LENGTH
		};
	}
}
