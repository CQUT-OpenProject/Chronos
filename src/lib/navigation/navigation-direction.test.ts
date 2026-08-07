import { describe, expect, it } from 'vite-plus/test';
import { getNavigationDirection } from './navigation-direction';

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
