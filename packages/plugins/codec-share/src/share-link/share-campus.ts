import type { Course, PeriodTime } from '@chronos/core';

export type ShareCampusId = 'huaxi' | 'liangjiang';

const SHARE_CAMPUS_IDS: ShareCampusId[] = ['huaxi', 'liangjiang'];
const DEFAULT_SHARE_CAMPUS_ID: ShareCampusId = 'liangjiang';

const SHARE_CAMPUS_PERIOD_TIMES: Record<ShareCampusId, PeriodTime[]> = {
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

export function getCampusDefaultPeriodTimes(id: ShareCampusId): PeriodTime[] {
	return SHARE_CAMPUS_PERIOD_TIMES[id].map((period) => ({ ...period }));
}

export function campusIdToShareIndex(id: ShareCampusId): number {
	const index = SHARE_CAMPUS_IDS.indexOf(id);
	return index >= 0 ? index : 0;
}

export function shareIndexToCampusId(index: number): ShareCampusId {
	return SHARE_CAMPUS_IDS[index] ?? DEFAULT_SHARE_CAMPUS_ID;
}

export function inferCampusIdFromCourses(courses: Course[]): ShareCampusId {
	let huaxiCount = 0;
	let liangjiangCount = 0;

	for (const course of courses) {
		const location = course.location;
		if (location.includes('花溪')) huaxiCount += 1;
		if (location.includes('两江')) liangjiangCount += 1;
	}

	if (huaxiCount > liangjiangCount) return 'huaxi';
	if (liangjiangCount > huaxiCount) return 'liangjiang';
	return DEFAULT_SHARE_CAMPUS_ID;
}

export function resolveShareCampusId(
	explicit: ShareCampusId | null | undefined,
	courses: Course[]
): ShareCampusId {
	if (explicit === 'huaxi' || explicit === 'liangjiang') return explicit;
	return inferCampusIdFromCourses(courses);
}
