import type { NavigationDirection } from './navigation-direction';

export type ViewTransitionNavigation = {
	type: 'link' | 'popstate' | 'goto' | 'leave' | 'form' | 'enter';
	event?: PopStateEvent;
};

export const NAV_DIRECTION_CLASSES = ['nav-forward', 'nav-back'] as const;

export function hasViewTransitionSupport(): boolean {
	return typeof document !== 'undefined' && 'startViewTransition' in document;
}

export function hasUAVisualTransition(navigation: ViewTransitionNavigation): boolean {
	return navigation.type === 'popstate' && navigation.event?.hasUAVisualTransition === true;
}

export function shouldUseViewTransitionWhenSupported(
	direction: NavigationDirection,
	navigation: ViewTransitionNavigation
): boolean {
	if (direction === 'none') return false;
	if (hasUAVisualTransition(navigation)) return false;
	return direction === 'forward' || direction === 'back';
}

export function shouldUseViewTransition(
	direction: NavigationDirection,
	navigation: ViewTransitionNavigation
): boolean {
	if (!hasViewTransitionSupport()) return false;
	return shouldUseViewTransitionWhenSupported(direction, navigation);
}

export function setNavDirectionClass(direction: 'forward' | 'back'): void {
	document.documentElement.classList.remove(...NAV_DIRECTION_CLASSES);
	document.documentElement.classList.add(`nav-${direction}`);
}

export function clearNavDirectionClass(): void {
	document.documentElement.classList.remove(...NAV_DIRECTION_CLASSES);
}

let activeTransitionGeneration = 0;

export function nextNavDirectionTransitionGeneration(): number {
	return ++activeTransitionGeneration;
}

export function isActiveNavDirectionTransition(generation: number): boolean {
	return generation === activeTransitionGeneration;
}

export function beginNavDirectionTransition(direction: 'forward' | 'back'): number {
	const generation = nextNavDirectionTransitionGeneration();
	setNavDirectionClass(direction);
	return generation;
}

export function endNavDirectionTransition(generation: number): void {
	if (isActiveNavDirectionTransition(generation)) {
		clearNavDirectionClass();
	}
}

/** @internal Test helper */
export function resetNavDirectionTransitionGeneration(): void {
	activeTransitionGeneration = 0;
}
