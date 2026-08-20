import { getCampusDefaultPeriodTimes, DEFAULT_CQUT_CAMPUS_ID } from './cqut-campus';
import type { PeriodTime } from '@chronos/core';

export { currentWeekMonday } from '@chronos/core';

export function defaultPeriodTimes(): PeriodTime[] {
	return getCampusDefaultPeriodTimes(DEFAULT_CQUT_CAMPUS_ID);
}
