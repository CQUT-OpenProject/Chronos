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

import { configureNavigateBack, navigateBack } from './navigate-back';
import {
	canPopInAppHistory,
	initNavJournal,
	markDeepLinkEntry,
	recordNavigation
} from './nav-journal';

describe('navigateBack', () => {
	const goto = vi.fn();
	const setActiveTab = vi.fn();
	const back = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.pageState.current = {};
		initNavJournal('/');
		configureNavigateBack({ goto, setActiveTab });
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

	it('calls history.back when in-app history can pop', () => {
		recordNavigation('/', '/about', 'link');

		navigateBack({ kind: 'route', href: '/about' });

		expect(canPopInAppHistory()).toBe(true);
		expect(back).toHaveBeenCalled();
		expect(goto).not.toHaveBeenCalled();
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
});
