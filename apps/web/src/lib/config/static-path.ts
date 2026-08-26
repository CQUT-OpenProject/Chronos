import { base } from '$app/paths';

/** Resolve a `static/` file path for the current deploy base (e.g. GitHub Pages). */
export function staticPath(path: string): string {
	return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
