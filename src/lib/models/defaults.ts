import { getCampusDefaultPeriodTimes, DEFAULT_CQUT_CAMPUS_ID } from './cqut-campus';
import { formatIsoDate, parseIsoDate, previousOrSameMonday } from '$lib/domain/date';
import type { PeriodTime } from './timetable';

export function defaultPeriodTimes(): PeriodTime[] {
	return getCampusDefaultPeriodTimes(DEFAULT_CQUT_CAMPUS_ID);
}

export function currentWeekMonday(referenceDate: string): string {
	return formatIsoDate(previousOrSameMonday(parseIsoDate(referenceDate)));
}
