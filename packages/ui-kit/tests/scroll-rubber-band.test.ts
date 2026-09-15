import { describe, expect, it } from 'vite-plus/test';
import { computeNextPullOffset, dampenOverscroll } from '../src/actions/scroll-rubber-band';

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

describe('computeNextPullOffset', () => {
	it('does not engage while native scroll is still moving at a boundary', () => {
		expect(computeNextPullOffset(0, -8, false, true, true)).toBe(0);
		expect(computeNextPullOffset(0, 8, true, false, true)).toBe(0);
	});

	it('engages after a continuous scroll pins at the bottom', () => {
		expect(computeNextPullOffset(0, -8, false, true, false)).toBe(-8);
	});

	it('engages a downward pull when already pinned at the top', () => {
		expect(computeNextPullOffset(0, 8, true, false, false)).toBe(8);
	});

	it('does not engage a content-direction swipe at the top', () => {
		expect(computeNextPullOffset(0, -8, true, false, false)).toBe(0);
	});

	it('clears pull when reversing from rubber-band into content', () => {
		expect(computeNextPullOffset(12, -20, true, false, false)).toBe(0);
	});

	it('accumulates pull while scroll stays pinned at the boundary', () => {
		expect(computeNextPullOffset(-12, -4, false, true, false)).toBe(-16);
	});

	it('clears pull immediately when native scroll resumes', () => {
		expect(computeNextPullOffset(-24, 6, false, true, true)).toBe(0);
	});

	it('engages both directions on a non-scrollable page', () => {
		expect(computeNextPullOffset(0, 8, true, true, false)).toBe(8);
		expect(computeNextPullOffset(0, -8, true, true, false)).toBe(-8);
	});
});
