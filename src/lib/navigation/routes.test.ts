import { describe, expect, it } from 'vite-plus/test';
import { isSecondaryRoute, SECONDARY_ROUTES } from './routes';

describe('navigation routes', () => {
	it('marks all secondary routes as secondary', () => {
		for (const route of SECONDARY_ROUTES) {
			expect(isSecondaryRoute(route)).toBe(true);
		}
	});

	it('does not treat unknown routes as secondary', () => {
		expect(isSecondaryRoute('/unknown')).toBe(false);
	});
});
