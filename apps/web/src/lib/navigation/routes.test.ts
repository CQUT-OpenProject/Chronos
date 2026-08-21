import { describe, expect, it, vi } from 'vite-plus/test';
import { secondaryRouteRoots } from '../../routes/(secondary)/navigation';
import { tabRoutes } from '../../routes/(tabs)/navigation';
import { isSecondaryRoute } from './routes';

vi.mock('$app/paths', () => ({
	base: '/Chronos'
}));

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
		expect(isSecondaryRoute('/about/update')).toBe(true);
		expect(isSecondaryRoute('/about/releases')).toBe(true);
		expect(isSecondaryRoute('/about/releases/v0.1.0')).toBe(true);
		expect(isSecondaryRoute('/transfer/import/confirm')).toBe(true);
		expect(isSecondaryRoute('/plugins/tool-wallpaper')).toBe(true);
		expect(isSecondaryRoute('/open-source-licenses/project')).toBe(true);
		expect(isSecondaryRoute('/plugins')).toBe(true);
		expect(isSecondaryRoute('/plugins/cqut-online')).toBe(true);
		expect(isSecondaryRoute('/plugins/cqut-online/view')).toBe(true);
	});

	it('does not treat unknown routes as secondary', () => {
		expect(isSecondaryRoute('/unknown')).toBe(false);
	});

	it('normalizes deploy-base pathnames before matching', () => {
		for (const route of tabRoutes) {
			expect(isSecondaryRoute(`/Chronos${route === '/' ? '' : route}`)).toBe(false);
		}

		expect(isSecondaryRoute('/Chronos/about')).toBe(true);
		expect(isSecondaryRoute('/Chronos/about/install')).toBe(true);
		expect(isSecondaryRoute('/Chronos/mine')).toBe(false);
	});
});
