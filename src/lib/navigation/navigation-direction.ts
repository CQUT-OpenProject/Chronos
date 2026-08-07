import { isSecondaryRoute } from './routes';

export type NavigationDirection = 'forward' | 'back' | 'none';

function pathDepth(pathname: string): number {
	return pathname.split('/').filter(Boolean).length;
}

export function getNavigationDirection(from: string | undefined, to: string): NavigationDirection {
	if (!from) {
		return 'none';
	}

	const fromSecondary = isSecondaryRoute(from);
	const toSecondary = isSecondaryRoute(to);

	if (!fromSecondary && !toSecondary) {
		return 'none';
	}

	if (!fromSecondary && toSecondary) {
		return 'forward';
	}

	if (fromSecondary && !toSecondary) {
		return 'back';
	}

	const fromDepth = pathDepth(from);
	const toDepth = pathDepth(to);

	if (toDepth > fromDepth) {
		return 'forward';
	}

	if (toDepth < fromDepth) {
		return 'back';
	}

	return 'forward';
}
