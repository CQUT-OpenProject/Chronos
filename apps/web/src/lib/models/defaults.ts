import type { PeriodTime } from '@chronos/core';

export function defaultPeriodTimes(): PeriodTime[] {
	return [
		{ index: 1, startTime: '08:00', endTime: '08:45' },
		{ index: 2, startTime: '08:55', endTime: '09:40' },
		{ index: 3, startTime: '10:00', endTime: '10:45' },
		{ index: 4, startTime: '10:55', endTime: '11:40' },
		{ index: 5, startTime: '14:00', endTime: '14:45' },
		{ index: 6, startTime: '14:55', endTime: '15:40' },
		{ index: 7, startTime: '16:00', endTime: '16:45' },
		{ index: 8, startTime: '16:55', endTime: '17:40' },
		{ index: 9, startTime: '19:00', endTime: '19:45' },
		{ index: 10, startTime: '19:55', endTime: '20:40' }
	];
}
