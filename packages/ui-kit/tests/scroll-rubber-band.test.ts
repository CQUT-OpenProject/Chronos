import { describe, expect, it } from 'vite-plus/test';
import { dampenOverscroll } from '../src/actions/scroll-rubber-band';

describe('dampenOverscroll', () => {
	it('returns zero for zero delta', () => {
		expect(dampenOverscroll(0)).toBe(0);
	});

	it('dampens positive and negative travel with the same magnitude', () => {
		expect(dampenOverscroll(40)).toBeCloseTo(-dampenOverscroll(-40), 5);
	});

	it('approaches but does not exceed max pull', () => {
		expect(Math.abs(dampenOverscroll(10_000, 120))).toBeLessThanOrEqual(120);
	});
});
