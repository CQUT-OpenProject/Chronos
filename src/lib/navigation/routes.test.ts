import { describe, expect, it } from 'vite-plus/test';
import { isSecondaryRoute, isTabBarVisible, SECONDARY_ROUTES } from './routes';

describe('navigation routes', () => {
	it('marks all secondary routes as secondary', () => {
		for (const route of SECONDARY_ROUTES) {
			expect(isSecondaryRoute(route)).toBe(true);
			expect(isTabBarVisible(route)).toBe(false);
		}
	});

	it('keeps tab routes visible', () => {
		expect(isTabBarVisible('/')).toBe(true);
		expect(isTabBarVisible('/mine')).toBe(true);
	});

	it('does not treat unknown routes as secondary', () => {
		expect(isSecondaryRoute('/unknown')).toBe(false);
		expect(isTabBarVisible('/unknown')).toBe(true);
	});
});
