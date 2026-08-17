import type {
	OnlineScheduleCampusContext,
	OnlineSchedulePayload
} from '$lib/models/online-schedule';
import type { Timetable } from '$lib/models/timetable';
import type { AppResult } from '../result/app-result';

/**
 * Online-schedule codec seam: `OnlineSchedulePayload` JSON ↔ `Timetable`, with campus context.
 * Default adapter: `DefaultTimetableShareCodec`.
 * Share links use `TimetableShareLinkCodec` instead — wire format and campus sourcing differ.
 *
 * | Entry                    | Use case                       | Direction    |
 * | ------------------------ | ------------------------------ | ------------ |
 * | Online edu login preview | `PreviewOnlineTimetableUseCase` | `toTimetable` |
 * | Share link / HTML / export | —                            | not used     |
 */
export interface TimetableShareCodec {
	toTimetable(
		payload: OnlineSchedulePayload,
		campusContext?: OnlineScheduleCampusContext
	): AppResult<Timetable>;
}
