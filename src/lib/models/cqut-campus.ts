import type { Course } from './course';
import type { PeriodTime } from './timetable';

export const CQUT_CAMPUSES = {
	liangjiang: { apiName: '两江校区' },
	huaxi: { apiName: '花溪校区' }
} as const;

export type CqutCampusId = keyof typeof CQUT_CAMPUSES;

export const CQUT_CAMPUS_IDS = Object.keys(CQUT_CAMPUSES) as CqutCampusId[];

export const DEFAULT_CQUT_CAMPUS_ID: CqutCampusId = 'liangjiang';

/** 两江校区节次时间（与 CFC / 校历两江列一致） */
const LIANGJIANG_PERIOD_TIMES: PeriodTime[] = [
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
];

/** 花溪校区节次时间（与校历花溪列一致） */
const HUAXI_PERIOD_TIMES: PeriodTime[] = [
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
];

export const CQUT_CAMPUS_DEFAULT_PERIOD_TIMES: Record<CqutCampusId, PeriodTime[]> = {
	liangjiang: LIANGJIANG_PERIOD_TIMES,
	huaxi: HUAXI_PERIOD_TIMES
};

export function getCampusApiName(id: CqutCampusId): string {
	return CQUT_CAMPUSES[id].apiName;
}

export function getCampusDefaultPeriodTimes(id: CqutCampusId): PeriodTime[] {
	return CQUT_CAMPUS_DEFAULT_PERIOD_TIMES[id].map((period) => ({ ...period }));
}

export function isCqutCampusId(value: string): value is CqutCampusId {
	return value in CQUT_CAMPUSES;
}

export function resolveCampusIdFromApiName(value: string | null | undefined): CqutCampusId {
	const trimmed = value?.trim();
	if (!trimmed) return DEFAULT_CQUT_CAMPUS_ID;
	if (isCqutCampusId(trimmed)) return trimmed;

	const byApi = CQUT_CAMPUS_IDS.find((id) => CQUT_CAMPUSES[id].apiName === trimmed);
	return byApi ?? DEFAULT_CQUT_CAMPUS_ID;
}

export function inferCampusIdFromCourses(courses: Course[]): CqutCampusId {
	let huaxiCount = 0;
	let liangjiangCount = 0;

	for (const course of courses) {
		const location = course.location;
		if (location.includes('花溪')) huaxiCount += 1;
		if (location.includes('两江')) liangjiangCount += 1;
	}

	if (huaxiCount > liangjiangCount) return 'huaxi';
	if (liangjiangCount > huaxiCount) return 'liangjiang';
	return DEFAULT_CQUT_CAMPUS_ID;
}

export function campusIdToShareIndex(id: CqutCampusId): number {
	const index = CQUT_CAMPUS_IDS.indexOf(id);
	return index >= 0 ? index : 0;
}

export function shareIndexToCampusId(index: number): CqutCampusId {
	return CQUT_CAMPUS_IDS[index] ?? DEFAULT_CQUT_CAMPUS_ID;
}

export function resolveShareCampusId(
	explicit: CqutCampusId | null | undefined,
	courses: Course[]
): CqutCampusId {
	if (explicit && isCqutCampusId(explicit)) return explicit;
	return inferCampusIdFromCourses(courses);
}
