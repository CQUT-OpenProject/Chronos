import type { CqutCampusId } from './cqut-campus';
import type { PeriodTime } from './timetable';
import type {
	OnlineScheduleEvent,
	OnlineSchedulePayload,
	OnlineScheduleWeekDay
} from '@chronos/plugin-source-cqut';

export type { OnlineScheduleEvent, OnlineSchedulePayload, OnlineScheduleWeekDay };

export interface OnlineScheduleCampusContext {
	campusId: CqutCampusId;
	campusPeriodTimes: Record<CqutCampusId, PeriodTime[]>;
}

export interface OnlineScheduleFetchResult {
	schedule: OnlineSchedulePayload;
	campus?: OnlineScheduleCampusContext;
}

export function emptyOnlineSchedulePayload(): OnlineSchedulePayload {
	return {
		yearTerm: '',
		weekNum: '',
		nowMonth: '',
		importSource: '',
		termStartDate: null,
		yearTermList: [],
		weekList: [],
		weekDayList: [],
		eventList: []
	};
}
