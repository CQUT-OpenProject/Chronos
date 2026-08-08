import { describe, expect, it } from 'vite-plus/test';
import { secondaryRouteRoots } from '../../routes/(secondary)/navigation';
import { tabRoutes } from '../../routes/(tabs)/navigation';
import { isSecondaryRoute } from './routes';

describe('navigation routes', () => {
	it('does not treat tab routes as secondary', () => {
		for (const route of tabRoutes) {
			expect(isSecondaryRoute(route)).toBe(false);
		}
	});

	it('treats each secondary root and its children as secondary', () => {
		for (const root of secondaryRouteRoots) {
			expect(isSecondaryRoute(root)).toBe(true);
		}

		expect(isSecondaryRoute('/about/install')).toBe(true);
		expect(isSecondaryRoute('/about/releases')).toBe(true);
		expect(isSecondaryRoute('/about/releases/v0.1.0')).toBe(true);
		expect(isSecondaryRoute('/transfer/import/confirm')).toBe(true);
		expect(isSecondaryRoute('/open-source-licenses/project')).toBe(true);
	});

	it('does not treat unknown routes as secondary', () => {
		expect(isSecondaryRoute('/unknown')).toBe(false);
	});
});
