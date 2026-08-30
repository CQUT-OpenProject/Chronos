import { describe, expect, it, vi } from 'vite-plus/test';
import { secondaryRouteRoots } from '../../routes/(secondary)/navigation';
import { isSecondaryRoute, isShellRoute } from './routes';

vi.mock('$app/paths', () => ({
	base: '/Chronos'
}));

describe('navigation routes', () => {
	it('treats only the shell root as a shell route', () => {
		expect(isShellRoute('/')).toBe(true);
		expect(isShellRoute('')).toBe(true);
		expect(isShellRoute('/mine')).toBe(false);
		expect(isShellRoute('/today')).toBe(false);
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

	it('treats non-shell routes as secondary', () => {
		expect(isSecondaryRoute('/unknown')).toBe(true);
		expect(isSecondaryRoute('/mine')).toBe(true);
		expect(isSecondaryRoute('/today')).toBe(true);
	});

	it('normalizes deploy-base pathnames before matching', () => {
		expect(isShellRoute('/Chronos')).toBe(true);
		expect(isSecondaryRoute('/Chronos')).toBe(false);

		expect(isSecondaryRoute('/Chronos/about')).toBe(true);
		expect(isSecondaryRoute('/Chronos/about/install')).toBe(true);
		expect(isSecondaryRoute('/Chronos/mine')).toBe(true);
	});
});
