import { base } from '$app/paths';

/** Strip deploy base (e.g. `/Chronos`) so route helpers compare app-relative paths. */
export function toAppPathname(pathname: string): string {
	if (!base) return pathname;
	if (pathname === base || pathname === `${base}/`) return '/';
	if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length);
	return pathname;
}
