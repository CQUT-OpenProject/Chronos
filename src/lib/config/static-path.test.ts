import { describe, expect, it, vi } from 'vite-plus/test';
import { staticPath } from './static-path';

vi.mock('$app/paths', () => ({
	base: '/Chronos'
}));

describe('staticPath', () => {
	it('prefixes static paths with the deploy base', () => {
		expect(staticPath('/chronos-icon.svg')).toBe('/Chronos/chronos-icon.svg');
		expect(staticPath('legal/privacy-policy.md')).toBe('/Chronos/legal/privacy-policy.md');
	});
});
