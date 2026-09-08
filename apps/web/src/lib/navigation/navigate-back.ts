import { replaceState } from '$app/navigation';
import type { Pathname } from '$app/types';
import { resolve } from '$app/paths';
import { canPopInAppHistory } from './nav-journal';

export type BackFallback = { kind: 'shell'; tab?: string } | { kind: 'route'; href: Pathname };

export type NavigateBackDeps = {
	goto: (href: string) => void | Promise<void>;
	setActiveTab: (tabId: string) => void;
};

let deps: NavigateBackDeps | null = null;

export function configureNavigateBack(next: NavigateBackDeps): void {
	deps = next;
}

function applyFallback(fallback: BackFallback): void {
	if (!deps) return;

	if (fallback.kind === 'shell') {
		if (fallback.tab) deps.setActiveTab(fallback.tab);
		void deps.goto(resolve('/'));
		return;
	}

	void deps.goto(resolve(fallback.href));
}

export function navigateBack(fallback: BackFallback): void {
	if (typeof history !== 'undefined' && canPopInAppHistory()) {
		history.back();
		return;
	}

	applyFallback(fallback);
}

export function restoreShellTabFromHistory(setActiveTab: (tabId: string) => void): void {
	if (typeof history === 'undefined') return;
	const state = history.state as App.PageState | null;
	const tab = state?.chronosShellTab;
	if (tab) setActiveTab(tab);
}

export function stampShellTabOnHistory(shellTabId: string): void {
	if (typeof history === 'undefined') return;
	const state = (history.state ?? {}) as App.PageState;
	try {
		replaceState('', { ...state, chronosShellTab: shellTabId });
	} catch {
		// Router not initialized yet.
	}
}
