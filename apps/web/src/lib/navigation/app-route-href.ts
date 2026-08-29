import { base, resolve } from '$app/paths';

/** Prefix app-relative hrefs with the deploy base (e.g. GitHub Pages `/Chronos`). */
export function appRouteHref(href: string): string {
	if (!href || /^https?:\/\//.test(href) || href.startsWith('//')) return href;
	if (base && (href === base || href.startsWith(`${base}/`))) return href;
	return resolve(href as any);
}
