import { TimetableImportSource } from '$lib/models/timetable';
import type { AuthSnapshot } from '$lib/models/auth';
import type { RemoteTimetableSource } from '../interfaces/remote-timetable-source';
import type { TimetableShareCodec } from '../interfaces/timetable-share-codec';
import { flatMap, map, type AppResult } from '../result/app-result';

export class PreviewOnlineTimetableUseCase {
	constructor(
		private readonly remoteTimetableSource: RemoteTimetableSource,
		private readonly timetableShareCodec: TimetableShareCodec
	) {}

	async invoke(
		authSnapshot: AuthSnapshot
	): Promise<AppResult<import('$lib/models/timetable').Timetable>> {
		const payload = await this.remoteTimetableSource.fetchSchedule(authSnapshot);
		const timetable = await flatMap(payload, (value) =>
			this.timetableShareCodec.toTimetable(value)
		);
		return map(timetable, (value) => ({
			...value,
			importMetadata: { source: TimetableImportSource.ONLINE_EDU }
		}));
	}
}
