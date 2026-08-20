import type { PeriodTime } from '@chronos/core';

export type CqutCampusId = 'huaxi' | 'liangjiang';

export const CQUT_DEFAULT_CAMPUS_PERIOD_TIMES: Record<CqutCampusId, PeriodTime[]> = {
	huaxi: [
		{ index: 1, startTime: '08:20', endTime: '09:05' },
		{ index: 2, startTime: '09:15', endTime: '10:00' },
		{ index: 3, startTime: '10:20', endTime: '11:05' },
		{ index: 4, startTime: '11:15', endTime: '12:00' },
		{ index: 5, startTime: '14:00', endTime: '14:45' },
		{ index: 6, startTime: '14:55', endTime: '15:40' },
		{ index: 7, startTime: '16:00', endTime: '16:45' },
		{ index: 8, startTime: '16:55', endTime: '17:40' },
		{ index: 9, startTime: '19:00', endTime: '19:45' },
		{ index: 10, startTime: '19:50', endTime: '20:35' }
	],
	liangjiang: [
		{ index: 1, startTime: '08:30', endTime: '09:15' },
		{ index: 2, startTime: '09:25', endTime: '10:10' },
		{ index: 3, startTime: '10:30', endTime: '11:15' },
		{ index: 4, startTime: '11:25', endTime: '12:10' },
		{ index: 5, startTime: '14:20', endTime: '15:05' },
		{ index: 6, startTime: '15:15', endTime: '16:00' },
		{ index: 7, startTime: '16:20', endTime: '17:05' },
		{ index: 8, startTime: '17:15', endTime: '18:00' },
		{ index: 9, startTime: '19:00', endTime: '19:45' },
		{ index: 10, startTime: '19:50', endTime: '20:35' }
	]
};
