import type { CqutCampusId } from './cqut-campus';
import type { PeriodTime } from './timetable';

export interface OnlineScheduleCampusContext {
	campusId: CqutCampusId;
	campusPeriodTimes: Record<CqutCampusId, PeriodTime[]>;
}

export interface OnlineScheduleFetchResult {
	schedule: OnlineSchedulePayload;
	campus?: OnlineScheduleCampusContext;
}

export interface OnlineScheduleWeekDay {
	weekDay: string;
	weekDate: string;
	today: boolean;
}

export interface OnlineScheduleEvent {
	weekNum: string;
	weekDay: string;
	weekList: string[];
	weekCover: string;
	sessionList: string[];
	sessionStart: string;
	sessionLast: string;
	eventName: string;
	address: string;
	memberName: string;
	remark: string;
	duplicateGroupType: string;
	duplicateGroup: number;
	eventType: string;
	eventID: string;
}

export interface OnlineSchedulePayload {
	yearTerm: string;
	weekNum: string;
	nowMonth: string;
	importSource: string;
	termStartDate: string | null;
	yearTermList: string[];
	weekList: string[];
	weekDayList: OnlineScheduleWeekDay[];
	eventList: OnlineScheduleEvent[];
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
