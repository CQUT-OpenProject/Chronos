import { describe, expect, it, beforeEach } from 'vite-plus/test';
import {
	getNavigationDirection,
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
		expect(getNavigationDirection('/about', '/about/version-release')).toBe('forward');
		expect(getNavigationDirection('/about', '/about/releases')).toBe('forward');
		expect(getNavigationDirection('/about/releases', '/about/releases/v0.1.0')).toBe('forward');
		expect(getNavigationDirection('/transfer/import', '/transfer/import/confirm')).toBe('forward');
	});

	it('returns back when going shallower in secondary routes', () => {
		expect(getNavigationDirection('/about/version-release', '/about')).toBe('back');
		expect(getNavigationDirection('/open-source-licenses/project', '/open-source-licenses')).toBe(
			'back'
		);
	});

	it('returns forward for lateral secondary navigation at same depth', () => {
		expect(getNavigationDirection('/about', '/theme-settings')).toBe('forward');
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
});
