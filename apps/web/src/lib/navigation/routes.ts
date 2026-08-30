import { toAppPathname } from './app-pathname';

export function isShellRoute(pathname: string): boolean {
	const appPathname = toAppPathname(pathname);
	return appPathname === '/' || appPathname === '';
}

export function isSecondaryRoute(pathname: string): boolean {
	return !isShellRoute(pathname);
}
