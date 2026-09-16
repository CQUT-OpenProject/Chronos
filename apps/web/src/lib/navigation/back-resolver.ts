import type { Pathname } from '$app/types';
import {
	findPrevRouteFrame,
	getTopFrame,
	getTopRoute,
	isDeepLinkEntry,
	popOverlay
} from './nav-stack';

export type BackFallback = { kind: 'shell'; tab?: string } | { kind: 'route'; href: Pathname };

export type BackPlan =
	| { type: 'close-overlay'; overlayId: string }
	| { type: 'goto-route'; pathname: string; shellTab?: string }
	| { type: 'fallback'; fallback: BackFallback };

export function resolveBack(fallback: BackFallback): BackPlan {
	const top = getTopFrame();
	if (!top) return { type: 'fallback', fallback };

	if (top.kind === 'overlay') {
		return { type: 'close-overlay', overlayId: top.id };
	}

	if (isDeepLinkEntry() || !findPrevRouteFrame()) {
		return { type: 'fallback', fallback };
	}

	const prev = findPrevRouteFrame();
	if (!prev) return { type: 'fallback', fallback };

	return {
		type: 'goto-route',
		pathname: prev.pathname,
		shellTab: prev.shellTab
	};
}

export function resolvePopstateBack(
	fromPath: string,
	toPath: string,
	fallback: BackFallback
): BackPlan | 'sync' {
	if (fromPath === toPath) {
		const top = getTopFrame();
		if (top?.kind === 'overlay') {
			applyPopstateOverlayClose(top.id);
		}
		return 'sync';
	}

	const topRoute = getTopRoute();
	if (!topRoute) return 'sync';

	if (isDeepLinkEntry()) {
		return { type: 'fallback', fallback };
	}

	const prev = findPrevRouteFrame();
	if (!prev) {
		if (toPath === topRoute.pathname) return 'sync';
		return { type: 'fallback', fallback };
	}

	if (toPath === prev.pathname) return 'sync';

	return {
		type: 'goto-route',
		pathname: prev.pathname,
		shellTab: prev.shellTab
	};
}

export function applyPopstateOverlayClose(overlayId: string): void {
	const top = getTopFrame();
	if (top?.kind === 'overlay' && top.id === overlayId) {
		popOverlay();
	}
}
