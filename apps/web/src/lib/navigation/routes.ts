import { secondaryRouteRoots } from '../../routes/(secondary)/navigation';
import { tabRoutes } from '../../routes/(tabs)/navigation';
import { toAppPathname } from './app-pathname';

export function isSecondaryRoute(pathname: string): boolean {
	const appPathname = toAppPathname(pathname);
	if ((tabRoutes as readonly string[]).includes(appPathname)) return false;
	return secondaryRouteRoots.some(
		(root) => appPathname === root || appPathname.startsWith(`${root}/`)
	);
}
