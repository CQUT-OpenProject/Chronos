import { describe, expect, it } from 'vite-plus/test';
import {
	getNavigationDirection,
	getTransitionDirection,
	initNavigationStack,
	resolveNavigationDirection,
	updateTransitionDirection
} from './navigation-direction';

describe('getNavigationDirection', () => {
	it('returns forward when entering secondary routes from the shell', () => {
		expect(getNavigationDirection('/', '/about')).toBe('forward');
		expect(getNavigationDirection('/', '/plugins')).toBe('forward');
		expect(getNavigationDirection('/', '/timetable/details')).toBe('forward');
	});

	it('returns back when leaving secondary routes to the shell', () => {
		expect(getNavigationDirection('/about', '/')).toBe('back');
		expect(getNavigationDirection('/plugins', '/')).toBe('back');
		expect(getNavigationDirection('/timetable/details', '/')).toBe('back');
	});

	it('returns forward when going deeper in secondary routes', () => {
		expect(getNavigationDirection('/about', '/about/update')).toBe('forward');
		expect(getNavigationDirection('/about/update', '/about/releases')).toBe('forward');
		expect(getNavigationDirection('/about/releases', '/about/releases/v0.1.0')).toBe('forward');
		expect(getNavigationDirection('/transfer/import', '/transfer/import/confirm')).toBe('forward');
	});

	it('returns back when going shallower in secondary routes', () => {
		expect(getNavigationDirection('/about/releases/v0.1.0', '/about/releases')).toBe('back');
		expect(getNavigationDirection('/open-source-licenses/project', '/open-source-licenses')).toBe(
			'back'
		);
	});

	it('returns forward for lateral secondary navigation at same depth', () => {
		expect(getNavigationDirection('/about', '/display-settings')).toBe('forward');
	});
});

describe('resolveNavigationDirection', () => {
	it('returns back when returning to a parent page at the same path depth', () => {
		initNavigationStack('/');
		expect(resolveNavigationDirection('/', '/about', 'link')).toBe('forward');
		expect(resolveNavigationDirection('/about', '/open-source-licenses', 'link')).toBe('forward');
		expect(resolveNavigationDirection('/open-source-licenses', '/about', 'link')).toBe('back');
	});

	it('returns back when leaving a third-level license page', () => {
		initNavigationStack('/about');
		resolveNavigationDirection('/about', '/open-source-licenses', 'link');
		resolveNavigationDirection('/open-source-licenses', '/open-source-licenses/project', 'link');
		expect(
			resolveNavigationDirection('/open-source-licenses/project', '/open-source-licenses', 'link')
		).toBe('back');
	});

	it('returns forward on popstate when browser goes forward', () => {
		initNavigationStack('/');
		resolveNavigationDirection('/', '/about', 'link');
		resolveNavigationDirection('/about', '/open-source-licenses', 'link');
		resolveNavigationDirection('/open-source-licenses', '/about', 'popstate', -1);

		expect(resolveNavigationDirection('/about', '/open-source-licenses', 'popstate', 1)).toBe(
			'forward'
		);
		// Stack must include /about below the current page for a stack-back transition.
		expect(resolveNavigationDirection('/open-source-licenses', '/about', 'link')).toBe('back');
	});

	it('returns back on popstate when browser goes back', () => {
		initNavigationStack('/');
		resolveNavigationDirection('/', '/about', 'link');
		resolveNavigationDirection('/about', '/open-source-licenses', 'link');

		expect(resolveNavigationDirection('/open-source-licenses', '/about', 'popstate', -1)).toBe(
			'back'
		);
		// Trimmed stack must not treat /open-source-licenses as an in-history back target.
		expect(resolveNavigationDirection('/about', '/open-source-licenses', 'link')).toBe('forward');
	});

	it('repairs stack when backing to a page not in history from a deep link', () => {
		initNavigationStack('/legal/privacy');

		expect(resolveNavigationDirection('/legal/privacy', '/about', 'link')).toBe('back');
		// Repaired stack must not retain /legal/privacy as a back target from /about.
		expect(resolveNavigationDirection('/about', '/legal/privacy', 'link')).toBe('forward');
	});
});

describe('updateTransitionDirection', () => {
	it('stores direction for transition to read at invocation time', () => {
		initNavigationStack('/');
		updateTransitionDirection('/', '/about', 'link');
		expect(getTransitionDirection()).toBe('forward');
	});

	it('stores back when leaving secondary routes', () => {
		initNavigationStack('/');
		updateTransitionDirection('/', '/about', 'link');
		updateTransitionDirection('/about', '/', 'link');
		expect(getTransitionDirection()).toBe('back');
	});

	it('stores forward on popstate when delta is positive', () => {
		initNavigationStack('/');
		updateTransitionDirection('/', '/about', 'link');
		updateTransitionDirection('/about', '/open-source-licenses', 'link');
		updateTransitionDirection('/open-source-licenses', '/about', 'popstate', -1);

		updateTransitionDirection('/about', '/open-source-licenses', 'popstate', 1);
		expect(getTransitionDirection()).toBe('forward');
	});
});
