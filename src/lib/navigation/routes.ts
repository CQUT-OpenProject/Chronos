import type { Pathname } from '$app/types';

export const SECONDARY_ROUTES = [
	'/timetable/details',
	'/timetable/course-editor',
	'/timetable/course-detail',
	'/manage-timetables',
	'/transfer/import',
	'/transfer/import/confirm',
	'/transfer/export',
	'/theme-settings',
	'/wallpaper',
	'/about',
	'/about/install',
	'/about/version-release',
	'/open-source-licenses',
	'/open-source-licenses/project',
	'/open-source-licenses/third-party'
] as const satisfies readonly Pathname[];

const secondaryRouteSet = new Set<string>(SECONDARY_ROUTES);

export function isSecondaryRoute(pathname: string): boolean {
	return secondaryRouteSet.has(pathname);
}
