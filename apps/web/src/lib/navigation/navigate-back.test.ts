import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const mocks = vi.hoisted(() => {
	const pageState: { current: App.PageState } = { current: {} };
	return {
		pageState,
		replaceState: vi.fn((_url: string, state: App.PageState) => {
			pageState.current = state;
		}),
		pushState: vi.fn((_url: string, state: App.PageState) => {
			pageState.current = state;
		})
	};
});

vi.mock('$app/navigation', () => ({
	replaceState: mocks.replaceState,
	pushState: mocks.pushState
}));

import { bindOverlayCloser } from './nav-coordinator';
import { configureNavigateBack, navigateBack } from './navigate-back';
import { initNavStack, markDeepLinkEntry, pushOverlay, recordNavigation } from './nav-stack';

describe('navigateBack', () => {
	const goto = vi.fn();
	const setActiveTab = vi.fn();
	const back = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.pageState.current = {};
		initNavStack('/');
		configureNavigateBack({
			goto,
			pushState: mocks.pushState,
			replaceState: mocks.replaceState,
			setActiveTab,
			historyBack: back
		});
		vi.stubGlobal('history', {
			back,
			get state() {
				return mocks.pageState.current;
			}
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('navigates to the previous route via goto when stack can pop', () => {
		recordNavigation('/', '/about', 'link');

		navigateBack({ kind: 'route', href: '/about' });

		expect(back).not.toHaveBeenCalled();
		expect(goto).toHaveBeenCalled();
	});

	it('falls back to shell navigation', () => {
		markDeepLinkEntry();

		navigateBack({ kind: 'shell', tab: 'mine' });

		expect(back).not.toHaveBeenCalled();
		expect(setActiveTab).toHaveBeenCalledWith('mine');
		expect(goto).toHaveBeenCalled();
	});

	it('falls back to route navigation', () => {
		markDeepLinkEntry();

		navigateBack({ kind: 'route', href: '/about' });

		expect(back).not.toHaveBeenCalled();
		expect(goto).toHaveBeenCalled();
	});

	it('closes overlays through the registry before leaving the page', () => {
		const close = vi.fn();
		bindOverlayCloser('bottom-sheet', close);
		recordNavigation('/', '/about', 'link');
		pushOverlay('bottom-sheet');

		navigateBack({ kind: 'shell' });

		expect(close).toHaveBeenCalled();
		expect(goto).not.toHaveBeenCalled();
	});
});
