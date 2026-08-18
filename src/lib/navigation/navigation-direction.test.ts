import { describe, expect, it, beforeEach } from 'vite-plus/test';
import {
	getNavigationDirection,
	getNavigationStack,
	getTransitionDirection,
	initNavigationStack,
	resetNavigationStack,
	resolveNavigationDirection,
	updateTransitionDirection
} from './navigation-direction';

describe('getNavigationDirection', () => {
	it('returns none for tab switches', () => {
		expect(getNavigationDirection('/', '/mine')).toBe('none');
		expect(getNavigationDirection('/mine', '/')).toBe('none');
	});

	it('returns forward when entering secondary routes', () => {
		expect(getNavigationDirection('/mine', '/about')).toBe('forward');
		expect(getNavigationDirection('/', '/timetable/course-detail')).toBe('forward');
	});

	it('returns back when leaving secondary routes', () => {
		expect(getNavigationDirection('/about', '/mine')).toBe('back');
		expect(getNavigationDirection('/timetable/course-detail', '/')).toBe('back');
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
	beforeEach(() => {
		resetNavigationStack();
	});

	it('returns back when returning to a parent page at the same path depth', () => {
		initNavigationStack('/mine');
		expect(resolveNavigationDirection('/mine', '/about', 'link')).toBe('forward');
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
		initNavigationStack('/mine');
		resolveNavigationDirection('/mine', '/about', 'link');
		resolveNavigationDirection('/about', '/open-source-licenses', 'link');
		resolveNavigationDirection('/open-source-licenses', '/about', 'popstate', -1);

		expect(resolveNavigationDirection('/about', '/open-source-licenses', 'popstate', 1)).toBe(
			'forward'
		);
		expect(getNavigationStack()).toEqual(['/mine', '/about', '/open-source-licenses']);
	});

	it('returns back on popstate when browser goes back', () => {
		initNavigationStack('/mine');
		resolveNavigationDirection('/mine', '/about', 'link');
		resolveNavigationDirection('/about', '/open-source-licenses', 'link');

		expect(resolveNavigationDirection('/open-source-licenses', '/about', 'popstate', -1)).toBe(
			'back'
		);
		expect(getNavigationStack()).toEqual(['/mine', '/about']);
	});

	it('repairs stack when backing to a page not in history from a deep link', () => {
		initNavigationStack('/legal/privacy');

		expect(resolveNavigationDirection('/legal/privacy', '/about', 'link')).toBe('back');
		expect(getNavigationStack()).toEqual(['/about']);
	});
});

describe('updateTransitionDirection', () => {
	beforeEach(() => {
		resetNavigationStack();
	});

	it('stores direction for transition to read at invocation time', () => {
		initNavigationStack('/mine');
		updateTransitionDirection('/mine', '/about', 'link');
		expect(getTransitionDirection()).toBe('forward');
	});

	it('stores back when leaving secondary routes', () => {
		initNavigationStack('/mine');
		updateTransitionDirection('/mine', '/about', 'link');
		updateTransitionDirection('/about', '/mine', 'link');
		expect(getTransitionDirection()).toBe('back');
	});

	it('stores forward on popstate when delta is positive', () => {
		initNavigationStack('/mine');
		updateTransitionDirection('/mine', '/about', 'link');
		updateTransitionDirection('/about', '/open-source-licenses', 'link');
		updateTransitionDirection('/open-source-licenses', '/about', 'popstate', -1);

		updateTransitionDirection('/about', '/open-source-licenses', 'popstate', 1);
		expect(getTransitionDirection()).toBe('forward');
	});
});
