import { describe, expect, it } from 'vite-plus/test';
import { HOST_SHELL_TAB_ROUTES, isHostShellTabRoute } from '../src/shell/host-tab-routes';

describe('host-tab-routes', () => {
	it('includes known tab routes', () => {
		expect(HOST_SHELL_TAB_ROUTES).toEqual(['/', '/today', '/mine']);
	});

	it('isHostShellTabRoute accepts registered routes only', () => {
		expect(isHostShellTabRoute('/')).toBe(true);
		expect(isHostShellTabRoute('/today')).toBe(true);
		expect(isHostShellTabRoute('/mine')).toBe(true);
		expect(isHostShellTabRoute('/custom')).toBe(false);
	});
});
