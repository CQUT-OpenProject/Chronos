import type { OnlineSchedulePayload } from '$lib/models/online-schedule';
import type { Timetable } from '$lib/models/timetable';
import type { AppResult } from '../result';

export interface TimetableShareCodec {
	decode(json: string): AppResult<OnlineSchedulePayload>;
	encode(timetable: Timetable): AppResult<string>;
	toTimetable(payload: OnlineSchedulePayload): AppResult<Timetable>;
}
