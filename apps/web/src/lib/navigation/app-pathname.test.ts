import { describe, expect, it, vi } from 'vite-plus/test';
import { toAppPathname } from './app-pathname';

vi.mock('$app/paths', () => ({
	base: '/Chronos'
}));

describe('toAppPathname', () => {
	it('strips the deploy base from tab and secondary routes', () => {
		expect(toAppPathname('/Chronos')).toBe('/');
		expect(toAppPathname('/Chronos/')).toBe('/');
		expect(toAppPathname('/Chronos/mine')).toBe('/mine');
		expect(toAppPathname('/Chronos/about/install')).toBe('/about/install');
	});

	it('leaves already app-relative paths unchanged', () => {
		expect(toAppPathname('/mine')).toBe('/mine');
		expect(toAppPathname('/about')).toBe('/about');
	});
});
