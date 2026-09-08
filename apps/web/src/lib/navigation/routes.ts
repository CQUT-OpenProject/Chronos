import type { Pathname } from '$app/types';
import { base, resolve } from '$app/paths';

/** Strip deploy base (e.g. `/Chronos`) so route helpers compare app-relative paths. */
export function toAppPathname(pathname: string): string {
	if (!base) return pathname;
	if (pathname === base || pathname === `${base}/`) return '/';
	if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length);
	return pathname;
}

/** Prefix app-relative hrefs with the deploy base (e.g. GitHub Pages `/Chronos`). */
export function appRouteHref(href: string): string {
	if (!href || /^https?:\/\//.test(href) || href.startsWith('//')) return href;
	if (base && (href === base || href.startsWith(`${base}/`))) return href;
	return resolve(href as Pathname);
}

export function isShellRoute(pathname: string): boolean {
	const appPathname = toAppPathname(pathname);
	return appPathname === '/' || appPathname === '';
}

export function isSecondaryRoute(pathname: string): boolean {
	return !isShellRoute(pathname);
}
