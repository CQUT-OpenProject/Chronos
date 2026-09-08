import { replaceState } from '$app/navigation';
import { toAppPathname } from './routes';

export type NavigationRecordType = 'link' | 'popstate' | 'goto' | 'leave' | 'form' | 'enter';

let journal: string[] = [];
let bootstrapDeepLinkPending = false;

export function initNavJournal(pathname: string): void {
	journal = [toAppPathname(pathname)];
	bootstrapDeepLinkPending = false;
}

export function getNavJournalDepth(): number {
	return journal.length;
}

export function getNavJournalTop(): string | undefined {
	return journal[journal.length - 1];
}

function appendPath(pathname: string): void {
	const path = toAppPathname(pathname);
	if (!path) return;
	if (journal[journal.length - 1] === path) return;
	journal.push(path);
}

function trimToPath(pathname: string): void {
	const path = toAppPathname(pathname);
	if (!path) return;
	const index = journal.lastIndexOf(path);
	if (index !== -1) {
		journal = journal.slice(0, index + 1);
		return;
	}
	if (journal.length > 0) {
		journal = [...journal.slice(0, -1), path];
	} else {
		journal = [path];
	}
}

export function recordNavigation(
	from: string | undefined,
	to: string,
	type: NavigationRecordType,
	delta?: number
): void {
	const toPath = toAppPathname(to);
	if (!toPath) return;

	if (type === 'popstate') {
		if (delta != null && delta > 0) {
			appendPath(toPath);
		} else {
			trimToPath(toPath);
		}
		return;
	}

	if (type === 'leave' || type === 'enter') return;

	if (journal.length === 0 && from) {
		journal = [toAppPathname(from)];
	}

	appendPath(toPath);
}

export function isDeepLinkEntry(): boolean {
	if (typeof history === 'undefined') return bootstrapDeepLinkPending && journal.length <= 1;
	const state = history.state as App.PageState | null;
	if (state?.chronosEntry === 'deeplink') return true;
	return bootstrapDeepLinkPending && journal.length <= 1;
}

export function markDeepLinkEntry(): void {
	bootstrapDeepLinkPending = true;
}

/** Sync deep-link marker into page state once SvelteKit router is ready. */
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

export function canPopInAppHistory(): boolean {
	if (journal.length <= 1) return false;
	if (isDeepLinkEntry()) return false;
	return true;
}
