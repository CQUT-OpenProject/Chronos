import { describe, expect, it, vi } from 'vite-plus/test';
import { appRouteHref } from './app-route-href';

vi.mock('$app/paths', () => ({
	base: '/Chronos',
	resolve: (path: string) => `/Chronos${path}`
}));

describe('appRouteHref', () => {
	it('prefixes app-relative paths with the deploy base', () => {
		expect(appRouteHref('/transfer/import')).toBe('/Chronos/transfer/import');
		expect(appRouteHref('/mine')).toBe('/Chronos/mine');
	});

	it('leaves already-prefixed and external hrefs unchanged', () => {
		expect(appRouteHref('/Chronos/transfer/import')).toBe('/Chronos/transfer/import');
		expect(appRouteHref('https://github.com/CQUT-OpenProject/Chronos')).toBe(
			'https://github.com/CQUT-OpenProject/Chronos'
		);
	});
});
