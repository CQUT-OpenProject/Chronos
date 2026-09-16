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
	canPopInAppStack,
	getNavJournalDepth,
	getNavJournalTop,
	getOverlayDepth,
	getRouteDepth,
	getStackDepth,
	initNavStack,
	isDeepLinkEntry,
	markDeepLinkEntry,
	popOverlay,
	pushOverlay,
	recordNavigation,
	replaceRoute,
	syncDeepLinkEntryState
} from './nav-stack';

describe('nav-stack', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.pageState.current = {};
		initNavStack('/');
		vi.stubGlobal('history', {
			get state() {
				return mocks.pageState.current;
			}
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('initializes with a single route frame', () => {
		initNavStack('/about');
		expect(getRouteDepth()).toBe(1);
		expect(getNavJournalTop()).toBe('/about');
	});

	it('appends forward navigations and dedupes consecutive paths', () => {
		recordNavigation('/', '/about', 'link');
		recordNavigation('/about', '/about/update', 'link');
		recordNavigation('/about/update', '/about/update', 'link');

		expect(getRouteDepth()).toBe(3);
		expect(getNavJournalTop()).toBe('/about/update');
	});

	it('replaces the top route on replace navigations', () => {
		initNavStack('/s');
		recordNavigation('/s', '/transfer/import/confirm', 'goto', undefined, { replace: true });

		expect(getRouteDepth()).toBe(1);
		expect(getNavJournalTop()).toBe('/transfer/import/confirm');
	});

	it('tracks overlay frames above the current route', () => {
		pushOverlay('bottom-sheet');
		expect(getStackDepth()).toBe(2);
		expect(getOverlayDepth()).toBe(1);
		expect(canPopInAppStack()).toBe(true);
	});

	it('pops overlay frames before route depth checks', () => {
		pushOverlay('bottom-sheet');
		expect(popOverlay()).toBe(true);
		expect(getOverlayDepth()).toBe(0);
		expect(getRouteDepth()).toBe(1);
	});

	it('trims journal on popstate back', () => {
		recordNavigation('/', '/about', 'link');
		recordNavigation('/about', '/about/update', 'link');
		recordNavigation('/about/update', '/about', 'popstate', -1);

		expect(getNavJournalDepth()).toBe(2);
		expect(getNavJournalTop()).toBe('/about');
	});

	it('marks and detects deep-link entries before router sync', () => {
		markDeepLinkEntry();
		expect(mocks.replaceState).not.toHaveBeenCalled();
		expect(isDeepLinkEntry()).toBe(true);
		expect(canPopInAppStack()).toBe(false);
	});

	it('syncs deep-link marker into page state when router is ready', () => {
		markDeepLinkEntry();
		syncDeepLinkEntryState();

		expect(mocks.replaceState).toHaveBeenCalledWith('', { chronosEntry: 'deeplink' });
		expect(isDeepLinkEntry()).toBe(true);
	});

	it('stops treating entry as deep-link after navigating deeper in-app', () => {
		initNavStack('/about');
		markDeepLinkEntry();
		recordNavigation('/about', '/about/update', 'link');

		expect(isDeepLinkEntry()).toBe(false);
	});

	it('replaces route frames directly via replaceRoute', () => {
		initNavStack('/s');
		replaceRoute('/transfer/import/confirm');
		expect(getNavJournalTop()).toBe('/transfer/import/confirm');
		expect(getRouteDepth()).toBe(1);
	});
});
