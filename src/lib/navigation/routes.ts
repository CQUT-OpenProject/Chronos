import { secondaryRouteRoots } from '../../routes/(secondary)/navigation';
import { tabRoutes } from '../../routes/(tabs)/navigation';

export function isSecondaryRoute(pathname: string): boolean {
	if ((tabRoutes as readonly string[]).includes(pathname)) return false;
	return secondaryRouteRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}
