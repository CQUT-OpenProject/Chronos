import type { Course } from '@chronos/core';
import {
	CQUT_DEFAULT_CAMPUS_PERIOD_TIMES,
	type CqutCampusId as PluginCqutCampusId
} from '@chronos/plugin-source-cqut';
import type { PeriodTime } from '@chronos/core';

export const CQUT_CAMPUSES = {
	liangjiang: { apiName: '两江校区' },
	huaxi: { apiName: '花溪校区' }
} as const;

export type CqutCampusId = PluginCqutCampusId;

export const CQUT_CAMPUS_IDS = Object.keys(CQUT_CAMPUSES) as CqutCampusId[];

export const DEFAULT_CQUT_CAMPUS_ID: CqutCampusId = 'liangjiang';

export const CQUT_CAMPUS_DEFAULT_PERIOD_TIMES: Record<CqutCampusId, PeriodTime[]> =
	CQUT_DEFAULT_CAMPUS_PERIOD_TIMES;

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
