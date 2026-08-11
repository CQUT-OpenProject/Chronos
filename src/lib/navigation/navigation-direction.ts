import { isSecondaryRoute } from './routes';
import { toAppPathname } from './app-pathname';

export type NavigationDirection = 'forward' | 'back' | 'none';

let navigationStack: string[] = [];
let currentTransitionDirection: NavigationDirection = 'none';

export function getTransitionDirection(): NavigationDirection {
	return currentTransitionDirection;
}

export function getNavigationStack(): readonly string[] {
	return navigationStack;
}

export function updateTransitionDirection(
	from: string | undefined,
	to: string,
	navigationType: 'link' | 'popstate' | 'goto' | 'leave' | 'form',
	historyDelta?: number
): NavigationDirection {
	const fromPath = from ? toAppPathname(from) : undefined;
	const toPath = toAppPathname(to);
	if (!toPath) {
		currentTransitionDirection = 'none';
		return currentTransitionDirection;
	}

	currentTransitionDirection = resolveNavigationDirection(
		fromPath,
		toPath,
		navigationType,
		historyDelta
	);
	return currentTransitionDirection;
}

function pathDepth(pathname: string): number {
	return pathname.split('/').filter(Boolean).length;
}

export function initNavigationStack(pathname: string): void {
	navigationStack = [toAppPathname(pathname)];
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

function applyStackForDirection(direction: NavigationDirection, to: string): void {
	if (direction === 'none') {
		navigationStack = [to];
		return;
	}

	if (direction === 'back') {
		if (navigationStack.lastIndexOf(to) !== -1) {
			trimStackTo(to);
		} else if (navigationStack.length > 0) {
			navigationStack = [...navigationStack.slice(0, -1), to];
		} else {
			navigationStack = [to];
		}
		return;
	}

	pushToStack(to);
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
	navigationType: 'link' | 'popstate' | 'goto' | 'leave' | 'form',
	historyDelta?: number
): NavigationDirection {
	if (navigationType === 'popstate') {
		if (historyDelta != null && historyDelta > 0) {
			pushToStack(to);
			return 'forward';
		}

		applyStackForDirection('back', to);
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

	if (isStackBack) {
		trimStackTo(to);
		return 'back';
	}

	const direction = getNavigationDirection(from, to);

	if (direction === 'none') {
		applyStackForDirection('none', to);
	} else if (direction === 'back') {
		applyStackForDirection('back', to);
	} else if (from && from !== to) {
		applyStackForDirection('forward', to);
	} else if (!from) {
		navigationStack = [to];
	}

	return direction;
}
