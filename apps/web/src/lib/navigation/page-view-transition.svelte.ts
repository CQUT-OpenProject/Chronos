import { onNavigate } from '$app/navigation';
import type { OnNavigate } from '@sveltejs/kit';
import { flushSync } from 'svelte';
import { isSecondaryRoute, toAppPathname } from './routes';

export type NavigationDirection = 'forward' | 'back' | 'none';
export type SecondaryTransitionDirection = 'forward' | 'back';

export type ViewTransitionNavigation = {
	type: 'link' | 'popstate' | 'goto' | 'leave' | 'form' | 'enter';
	event?: PopStateEvent;
};

export const NAV_DIRECTION_CLASSES = ['nav-forward', 'nav-back'] as const;
export const NAV_CROSS_SHELL_CLASS = 'vt-cross-shell';

let navigationStack: string[] = [];
let currentTransitionDirection: NavigationDirection = 'none';

export function getTransitionDirection(): NavigationDirection {
	return currentTransitionDirection;
}

function pathDepth(pathname: string): number {
	return pathname.split('/').filter(Boolean).length;
}

export function initNavigationStack(pathname: string): void {
	navigationStack = [toAppPathname(pathname)];
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
	if (!from) return 'none';

	const fromSecondary = isSecondaryRoute(from);
	const toSecondary = isSecondaryRoute(to);

	if (!fromSecondary && !toSecondary) return 'none';
	if (!fromSecondary && toSecondary) return 'forward';
	if (fromSecondary && !toSecondary) return 'back';

	const fromDepth = pathDepth(from);
	const toDepth = pathDepth(to);

	if (toDepth > fromDepth) return 'forward';
	if (toDepth < fromDepth) return 'back';
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

	if (!to) return 'none';

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

export function setNavDirectionClass(direction: 'forward' | 'back', crossShell = false): void {
	document.documentElement.classList.remove(...NAV_DIRECTION_CLASSES, NAV_CROSS_SHELL_CLASS);
	document.documentElement.classList.add(`nav-${direction}`);
	document.documentElement.classList.toggle(NAV_CROSS_SHELL_CLASS, crossShell);
}

export function clearNavDirectionClass(): void {
	document.documentElement.classList.remove(...NAV_DIRECTION_CLASSES, NAV_CROSS_SHELL_CLASS);
}

let activeTransitionGeneration = 0;

export function nextNavDirectionTransitionGeneration(): number {
	return ++activeTransitionGeneration;
}

export function isActiveNavDirectionTransition(generation: number): boolean {
	return generation === activeTransitionGeneration;
}

export function beginNavDirectionTransition(
	direction: 'forward' | 'back',
	crossShell = false
): number {
	const generation = nextNavDirectionTransitionGeneration();
	setNavDirectionClass(direction, crossShell);
	return generation;
}

export function endNavDirectionTransition(generation: number): void {
	if (isActiveNavDirectionTransition(generation)) {
		clearNavDirectionClass();
	}
}

export function createSecondaryTransitionGate() {
	let frozen = $state(false);
	let receded = $state(false);
	let previewPaintReady = $state(true);
	let shellHostEnabled = $state(false);
	let transitioning = $state(false);
	let revealForSnapshot = $state(false);

	function enableShellHost(): void {
		shellHostEnabled = true;
	}

	function settleOnRoute(pathname: string): void {
		if (isSecondaryRoute(pathname)) {
			if (!shellHostEnabled) return;
			frozen = true;
			receded = true;
			return;
		}

		shellHostEnabled = true;
		frozen = false;
		receded = false;
	}

	function syncRoute(pathname: string): void {
		if (transitioning) {
			if (!isSecondaryRoute(pathname)) shellHostEnabled = true;
			return;
		}

		previewPaintReady = true;
		settleOnRoute(pathname);
	}

	function beginTransition(_direction: SecondaryTransitionDirection, toSecondary: boolean): void {
		transitioning = true;
		previewPaintReady = false;
		revealForSnapshot = !toSecondary;
	}

	function finishTransition(toSecondary: boolean): void {
		transitioning = false;
		previewPaintReady = true;
		revealForSnapshot = false;
		if (toSecondary) {
			if (shellHostEnabled) {
				frozen = true;
				receded = true;
			}
			return;
		}

		shellHostEnabled = true;
		frozen = false;
		receded = false;
	}

	return {
		get frozen(): boolean {
			return frozen;
		},
		get receded(): boolean {
			return receded;
		},
		get previewPaintReady(): boolean {
			return previewPaintReady;
		},
		get shellHostEnabled(): boolean {
			return shellHostEnabled;
		},
		get transitioning(): boolean {
			return transitioning;
		},
		get revealForSnapshot(): boolean {
			return revealForSnapshot;
		},
		enableShellHost,
		settleOnRoute,
		syncRoute,
		beginTransition,
		finishTransition
	};
}

export type SecondaryTransitionGate = ReturnType<typeof createSecondaryTransitionGate>;
export const secondaryTransitionGate = createSecondaryTransitionGate();

function toViewTransitionNavigation(navigation: OnNavigate): ViewTransitionNavigation {
	return {
		type: navigation.type,
		event: navigation.type === 'popstate' ? navigation.event : undefined
	};
}

export function setupSecondaryPageViewTransition(
	gate: SecondaryTransitionGate = secondaryTransitionGate
): void {
	onNavigate((navigation) => {
		const toPath = navigation.to?.url.pathname ?? '';
		const fromPath = navigation.from?.url.pathname ?? '';
		const direction = getTransitionDirection();
		const toSecondary = isSecondaryRoute(toPath);
		const crossShell = isSecondaryRoute(fromPath) !== toSecondary;
		const viewNav = toViewTransitionNavigation(navigation);

		if (
			!shouldUseViewTransition(direction, viewNav) ||
			(direction !== 'forward' && direction !== 'back')
		) {
			void navigation.complete.then(() => {
				gate.syncRoute(toPath);
			});
			return;
		}

		gate.beginTransition(direction, toSecondary);

		return new Promise<void>((resolve) => {
			const generation = beginNavDirectionTransition(direction, crossShell);
			void document
				.startViewTransition(async () => {
					resolve();
					await navigation.complete;
					if (!toSecondary) flushSync();
				})
				.finished.finally(() => {
					endNavDirectionTransition(generation);
					gate.finishTransition(toSecondary);
				});
		});
	});
}
