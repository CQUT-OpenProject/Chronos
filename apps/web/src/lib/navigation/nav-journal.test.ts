import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const mocks = vi.hoisted(() => {
	const pageState: { current: App.PageState } = { current: {} };
	return {
		pageState,
		replaceState: vi.fn((_url: string, state: App.PageState) => {
			pageState.current = state;
		})
	};
});

vi.mock('$app/navigation', () => ({
	replaceState: mocks.replaceState
}));

import {
	canPopInAppHistory,
	getNavJournalDepth,
	getNavJournalTop,
	initNavJournal,
	isDeepLinkEntry,
	markDeepLinkEntry,
	recordNavigation,
	syncDeepLinkEntryState
} from './nav-journal';

describe('nav-journal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.pageState.current = {};
		initNavJournal('/');
		vi.stubGlobal('history', {
			get state() {
				return mocks.pageState.current;
			}
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('initializes with a single entry', () => {
		initNavJournal('/about');
		expect(getNavJournalDepth()).toBe(1);
		expect(getNavJournalTop()).toBe('/about');
	});

	it('appends forward navigations and dedupes consecutive paths', () => {
		recordNavigation('/', '/about', 'link');
		recordNavigation('/about', '/about/update', 'link');
		recordNavigation('/about/update', '/about/update', 'link');

		expect(getNavJournalDepth()).toBe(3);
		expect(getNavJournalTop()).toBe('/about/update');
	});

	it('trims journal on popstate back', () => {
		recordNavigation('/', '/about', 'link');
		recordNavigation('/about', '/about/update', 'link');
		recordNavigation('/about/update', '/about', 'popstate', -1);

		expect(getNavJournalDepth()).toBe(2);
		expect(getNavJournalTop()).toBe('/about');
	});

	it('appends journal on popstate forward', () => {
		recordNavigation('/', '/about', 'link');
		recordNavigation('/about', '/about/update', 'link');
		recordNavigation('/about/update', '/about', 'popstate', -1);
		recordNavigation('/about', '/about/update', 'popstate', 1);

		expect(getNavJournalDepth()).toBe(3);
		expect(getNavJournalTop()).toBe('/about/update');
	});

	it('marks and detects deep-link entries before router sync', () => {
		markDeepLinkEntry();
		expect(mocks.replaceState).not.toHaveBeenCalled();
		expect(isDeepLinkEntry()).toBe(true);
		expect(canPopInAppHistory()).toBe(false);
	});

	it('syncs deep-link marker into page state when router is ready', () => {
		markDeepLinkEntry();
		syncDeepLinkEntryState();

		expect(mocks.replaceState).toHaveBeenCalledWith('', { chronosEntry: 'deeplink' });
		expect(isDeepLinkEntry()).toBe(true);
	});

	it('stops treating entry as deep-link after navigating deeper in-app', () => {
		markDeepLinkEntry();
		recordNavigation('/about', '/about/update', 'link');

		expect(isDeepLinkEntry()).toBe(false);
	});

	it('allows pop when journal depth is greater than one', () => {
		recordNavigation('/', '/about', 'link');
		expect(canPopInAppHistory()).toBe(true);
	});
});
