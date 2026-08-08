import { isSecondaryRoute } from './routes';

export type NavigationDirection = 'forward' | 'back' | 'none';

let navigationStack: string[] = [];
let currentTransitionDirection: NavigationDirection = 'none';

export function getTransitionDirection(): NavigationDirection {
	return currentTransitionDirection;
}

export function updateTransitionDirection(
	from: string | undefined,
	to: string,
	navigationType: 'link' | 'popstate' | 'goto' | 'leave' | 'form'
): NavigationDirection {
	if (!to) {
		currentTransitionDirection = 'none';
		return currentTransitionDirection;
	}

	currentTransitionDirection = resolveNavigationDirection(from, to, navigationType);
	return currentTransitionDirection;
}

function pathDepth(pathname: string): number {
	return pathname.split('/').filter(Boolean).length;
}

export function initNavigationStack(pathname: string): void {
	navigationStack = [pathname];
}

export function resetNavigationStack(): void {
	navigationStack = [];
}

function trimStackTo(pathname: string): void {
	const index = navigationStack.lastIndexOf(pathname);
	if (index !== -1) {
		navigationStack = navigationStack.slice(0, index + 1);
	}
}

function pushToStack(pathname: string): void {
	if (navigationStack[navigationStack.length - 1] !== pathname) {
		navigationStack.push(pathname);
	}
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

export function resolveNavigationDirection(
	from: string | undefined,
	to: string,
	navigationType: 'link' | 'popstate' | 'goto' | 'leave' | 'form'
): NavigationDirection {
	if (navigationType === 'popstate') {
		trimStackTo(to);
		return 'back';
	}

	if (!to) {
		return 'none';
	}

	if (navigationStack.length === 0 && from) {
		navigationStack = [from];
	}

	const stackIndex = navigationStack.lastIndexOf(to);
	const isStackBack = stackIndex !== -1 && stackIndex < navigationStack.length - 1;

	let direction: NavigationDirection;
	if (isStackBack) {
		direction = 'back';
		trimStackTo(to);
	} else {
		direction = getNavigationDirection(from, to);

		if (direction === 'none') {
			navigationStack = [to];
		} else if (direction === 'back') {
			trimStackTo(to);
		} else if (from && from !== to) {
			pushToStack(to);
		} else if (!from) {
			navigationStack = [to];
		}
	}

	return direction;
}
