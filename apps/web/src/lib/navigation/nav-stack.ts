import { replaceState } from '$app/navigation';
import { toAppPathname } from './routes';

export type NavigationRecordType = 'link' | 'popstate' | 'goto' | 'leave' | 'form' | 'enter';
export type RouteEntry = 'deeplink' | 'normal';

export type RouteFrame = {
	kind: 'route';
	pathname: string;
	shellTab?: string;
	entry?: RouteEntry;
};

export type OverlayFrame = {
	kind: 'overlay';
	id: string;
};

export type NavFrame = RouteFrame | OverlayFrame;

export type RecordNavigationOptions = {
	replace?: boolean;
	shellTab?: string;
};

let stack: NavFrame[] = [];
let bootstrapDeepLinkPending = false;

export function initNavStack(pathname: string): void {
	const path = toAppPathname(pathname);
	stack = path ? [{ kind: 'route', pathname: path, entry: 'normal' }] : [];
	bootstrapDeepLinkPending = false;
}

export function getStack(): readonly NavFrame[] {
	return stack;
}

export function getStackDepth(): number {
	return stack.length;
}

export function getRouteDepth(): number {
	return stack.filter((frame) => frame.kind === 'route').length;
}

export function getTopFrame(): NavFrame | undefined {
	return stack[stack.length - 1];
}

export function getTopRoute(): RouteFrame | undefined {
	for (let i = stack.length - 1; i >= 0; i--) {
		const frame = stack[i];
		if (frame.kind === 'route') return frame;
	}
	return undefined;
}

export function getTopRoutePathname(): string | undefined {
	return getTopRoute()?.pathname;
}

export function getOverlayDepth(): number {
	let count = 0;
	for (let i = stack.length - 1; i >= 0; i--) {
		if (stack[i].kind === 'overlay') count++;
		else break;
	}
	return count;
}

export function findPrevRouteFrame(): RouteFrame | undefined {
	let foundTopRoute = false;
	for (let i = stack.length - 1; i >= 0; i--) {
		const frame = stack[i];
		if (frame.kind !== 'route') continue;
		if (foundTopRoute) return frame;
		foundTopRoute = true;
	}
	return undefined;
}

function stripTrailingOverlays(): void {
	while (stack.length > 0 && stack[stack.length - 1].kind === 'overlay') {
		stack.pop();
	}
}

export function pushRoute(
	pathname: string,
	meta: { shellTab?: string; entry?: RouteEntry } = {}
): void {
	const path = toAppPathname(pathname);
	if (!path) return;

	const top = stack[stack.length - 1];
	if (top?.kind === 'route' && top.pathname === path) return;

	stack.push({ kind: 'route', pathname: path, ...meta });
}

export function replaceRoute(
	pathname: string,
	meta: { shellTab?: string; entry?: RouteEntry } = {}
): void {
	const path = toAppPathname(pathname);
	if (!path) return;

	const frame: RouteFrame = { kind: 'route', pathname: path, ...meta };
	stripTrailingOverlays();

	if (stack.length === 0) {
		stack = [frame];
		return;
	}

	const top = stack[stack.length - 1];
	if (top.kind === 'route') {
		stack[stack.length - 1] = frame;
		return;
	}

	stack.push(frame);
}

export function pushOverlay(id: string): void {
	const top = stack[stack.length - 1];
	if (top?.kind === 'overlay' && top.id === id) return;
	stack.push({ kind: 'overlay', id });
}

export function popOverlay(): boolean {
	const top = stack[stack.length - 1];
	if (top?.kind !== 'overlay') return false;
	stack.pop();
	return true;
}

export function popRoute(): boolean {
	stripTrailingOverlays();
	if (stack.length <= 1) return false;
	stack.pop();
	return true;
}

export function trimToRoute(pathname: string): void {
	const path = toAppPathname(pathname);
	if (!path) return;

	for (let i = stack.length - 1; i >= 0; i--) {
		const frame = stack[i];
		if (frame.kind === 'route' && frame.pathname === path) {
			stack = stack.slice(0, i + 1);
			return;
		}
	}

	stripTrailingOverlays();
	if (stack.length > 0) {
		const top = stack[stack.length - 1];
		if (top.kind === 'route') {
			stack[stack.length - 1] = { kind: 'route', pathname: path };
			return;
		}
	}

	stack = [{ kind: 'route', pathname: path }];
}

export function resetStackToRoute(pathname: string, meta: { shellTab?: string } = {}): void {
	const path = toAppPathname(pathname);
	if (!path) return;
	stack = [{ kind: 'route', pathname: path, entry: 'normal', ...meta }];
}

export function recordNavigation(
	from: string | undefined,
	to: string,
	type: NavigationRecordType,
	delta?: number,
	options: RecordNavigationOptions = {}
): void {
	const toPath = toAppPathname(to);
	if (!toPath) return;

	if (type === 'popstate') {
		if (delta != null && delta > 0) {
			pushRoute(toPath);
		} else {
			trimToRoute(toPath);
		}
		return;
	}

	if (type === 'leave' || type === 'enter') return;

	if (stack.length === 0 && from) {
		const fromPath = toAppPathname(from);
		if (fromPath) stack = [{ kind: 'route', pathname: fromPath, entry: 'normal' }];
	}

	if (options.replace) {
		replaceRoute(toPath, { shellTab: options.shellTab });
		return;
	}

	pushRoute(toPath, { shellTab: options.shellTab });
}

export function isDeepLinkEntry(): boolean {
	if (typeof history === 'undefined') {
		return bootstrapDeepLinkPending && getRouteDepth() <= 1;
	}

	const state = history.state as App.PageState | null;
	if (state?.chronosEntry === 'deeplink') return true;
	return bootstrapDeepLinkPending && getRouteDepth() <= 1;
}

export function markDeepLinkEntry(): void {
	bootstrapDeepLinkPending = true;
	const top = getTopRoute();
	if (top) top.entry = 'deeplink';
}

export function syncDeepLinkEntryState(): void {
	if (!bootstrapDeepLinkPending || typeof history === 'undefined') return;

	const state = (history.state ?? {}) as App.PageState;
	if (state.chronosEntry === 'deeplink') {
		bootstrapDeepLinkPending = false;
		return;
	}

	try {
		replaceState('', { ...state, chronosEntry: 'deeplink' });
		bootstrapDeepLinkPending = false;
	} catch {
		// Router not initialized yet; keep the in-memory marker.
	}
}

export function stampShellTabOnRoute(shellTabId: string): void {
	const top = getTopRoute();
	if (top) top.shellTab = shellTabId;
}

export function canPopInAppStack(): boolean {
	if (getStackDepth() <= 1) return false;
	if (getTopFrame()?.kind === 'overlay') return true;
	if (getRouteDepth() <= 1) return false;
	if (isDeepLinkEntry()) return false;
	return true;
}

// Compatibility aliases for nav-journal consumers
export const initNavJournal = initNavStack;
export const getNavJournalDepth = getRouteDepth;
export const getNavJournalTop = getTopRoutePathname;
export const canPopInAppHistory = canPopInAppStack;
