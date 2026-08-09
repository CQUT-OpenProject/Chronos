export const CQUT_CAMPUSES = ['两江校区', '花溪校区'] as const;

export type CqutCampusName = (typeof CQUT_CAMPUSES)[number];

export const DEFAULT_CQUT_CAMPUS: CqutCampusName = '两江校区';

export function isCqutCampusName(value: string): value is CqutCampusName {
	return (CQUT_CAMPUSES as readonly string[]).includes(value);
}
