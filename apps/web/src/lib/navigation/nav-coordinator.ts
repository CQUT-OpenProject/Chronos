import type { Pathname } from '$app/types';
import { resolve } from '$app/paths';
import type { BeforeNavigate } from '@sveltejs/kit';
import {
	applyPopstateOverlayClose,
	resolveBack,
	resolvePopstateBack,
	type BackFallback
} from './back-resolver';
import { closeOverlayById, registerOverlayCloser } from './overlay-registry';
import {
	getTopFrame,
	getTopRoutePathname,
	isDeepLinkEntry,
	markDeepLinkEntry,
	popOverlay,
	popRoute,
	pushOverlay,
	recordNavigation,
	resetStackToRoute,
	syncDeepLinkEntryState,
	type NavigationRecordType
} from './nav-stack';
import { isSecondaryRoute, isShellRoute, toAppPathname } from './routes';

export type NavigationCoordinatorDeps = {
	goto: (href: string, opts?: { replaceState?: boolean }) => void | Promise<void>;
	pushState: (url: string, state: App.PageState) => void;
	replaceState: (url: string, state: App.PageState) => void;
	setActiveTab: (tabId: string) => void;
	historyBack: () => void;
};

let deps: NavigationCoordinatorDeps | null = null;
let pendingReplace = false;
let pendingShellTab: string | undefined;
const DEFAULT_PAGE_BACK_FALLBACK: BackFallback = { kind: 'shell' };
let pageBackFallback: BackFallback = DEFAULT_PAGE_BACK_FALLBACK;
let suppressOverlayHistoryPop = false;

export function configureNavigationCoordinator(next: NavigationCoordinatorDeps): void {
	deps = next;
}

export function registerPageBackFallback(fallback: BackFallback): () => void {
	pageBackFallback = fallback;
	return () => {
		pageBackFallback = DEFAULT_PAGE_BACK_FALLBACK;
	};
}

export function navigateForward(
	href: string,
	opts: { replace?: boolean } = {}
): void | Promise<void> {
	if (!deps) return;
	pendingReplace = opts.replace ?? false;
	return deps.goto(href, { replaceState: opts.replace });
}

function resetStackForFallback(fallback: BackFallback): void {
	if (fallback.kind === 'shell') {
		resetStackToRoute('/');
		return;
	}

	resetStackToRoute(fallback.href);
}

function applyFallback(fallback: BackFallback): void {
	if (!deps) return;

	if (fallback.kind === 'shell') {
		if (fallback.tab) deps.setActiveTab(fallback.tab);
		void deps.goto(resolve('/'));
		return;
	}

	void deps.goto((resolve as (path: string) => string)(fallback.href));
}

async function executeGotoRoute(pathname: string, shellTab?: string): Promise<void> {
	if (!deps) return;
	if (shellTab) deps.setActiveTab(shellTab);
	popRoute();
	await deps.goto((resolve as (path: string) => string)(pathname as Pathname));
}

export async function executeBackPlan(
	plan: ReturnType<typeof resolveBack>,
	fallback: BackFallback
): Promise<void> {
	if (!deps) return;

	switch (plan.type) {
		case 'close-overlay':
			closeOverlayById(plan.overlayId);
			break;
		case 'goto-route':
			await executeGotoRoute(plan.pathname, plan.shellTab);
			break;
		case 'fallback':
			resetStackForFallback(plan.fallback);
			applyFallback(plan.fallback);
			break;
	}
}

export function navigateBack(fallback: BackFallback): void {
	void executeBackPlan(resolveBack(fallback), fallback);
}

export function dismissOverlayWithoutHistoryPop(overlayId: string): void {
	const top = getTopFrame();
	if (top?.kind !== 'overlay' || top.id !== overlayId) return;
	suppressOverlayHistoryPop = true;
	popOverlay();
	suppressOverlayHistoryPop = false;
}

export function openOverlayHistory(overlayId: string): void {
	if (!deps) return;
	pushOverlay(overlayId);
	const state = (history.state ?? {}) as App.PageState;
	deps.pushState('', { ...state, chronosOverlay: overlayId });
}

export function closeOverlayHistory(overlayId: string): void {
	const top = getTopFrame();
	if (top?.kind !== 'overlay' || top.id !== overlayId) return;
	popOverlay();
	if (suppressOverlayHistoryPop) return;
	deps?.historyBack();
}

export function handleOverlayPopstate(): void {
	const top = getTopFrame();
	if (top?.kind === 'overlay') {
		applyPopstateOverlayClose(top.id);
	}
}

export function stampShellTabOnHistory(shellTabId: string): void {
	pendingShellTab = shellTabId;
	if (!deps || typeof history === 'undefined') return;
	const state = (history.state ?? {}) as App.PageState;
	try {
		deps.replaceState('', { ...state, chronosShellTab: shellTabId });
	} catch {
		// Router not initialized yet.
	}
}

export function restoreShellTabFromHistory(setActiveTab: (tabId: string) => void): void {
	if (typeof history === 'undefined') return;
	const state = history.state as App.PageState | null;
	const tab = state?.chronosShellTab;
	if (tab) setActiveTab(tab);
}

export function onBeforeNavigate({ from, to, type, delta, cancel }: BeforeNavigate): void {
	if (!to?.url.pathname) return;

	const fromPath = from?.url.pathname;
	const toPath = to.url.pathname;

	if (type === 'popstate') {
		const fromApp = fromPath ? toAppPathname(fromPath) : '';
		const toApp = toAppPathname(toPath);
		const plan = resolvePopstateBack(fromApp, toApp, pageBackFallback);

		if (plan === 'sync') {
			recordNavigation(fromPath, toPath, type, delta ?? undefined);
			if (isShellRoute(toPath)) restoreShellTabFromHistory((tabId) => deps?.setActiveTab(tabId));
			return;
		}

		cancel();
		void executeBackPlan(plan, pageBackFallback);
		return;
	}

	updateTransitionRecord(fromPath, toPath, type, delta ?? undefined);

	if (isShellRoute(toPath)) {
		restoreShellTabFromHistory((tabId) => deps?.setActiveTab(tabId));
	}
}

function updateTransitionRecord(
	fromPath: string | undefined,
	toPath: string,
	type: NavigationRecordType,
	delta?: number
): void {
	recordNavigation(fromPath, toPath, type, delta, {
		replace: pendingReplace,
		shellTab: pendingShellTab
	});
	pendingReplace = false;
	pendingShellTab = undefined;
}

export function onAfterNavigate(): void {
	syncDeepLinkEntryState();
}

export function bindOverlayCloser(overlayId: string, close: () => void): () => void {
	return registerOverlayCloser(overlayId, close);
}

export { markDeepLinkEntry, isDeepLinkEntry, syncDeepLinkEntryState, getTopRoutePathname };
