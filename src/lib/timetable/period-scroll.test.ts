import { describe, expect, it } from 'vite-plus/test';
import { calculatePeriodCenterScrollOffset, calculatePeriodOffsetByIndex } from './period-scroll';

describe('period-scroll', () => {
	it('clamps to 0 for period 1 at the top of the grid', () => {
		const offset = calculatePeriodCenterScrollOffset({
			periodTop: 0,
			periodHeight: 88,
			viewportHeight: 600,
			scrollHeight: 1056
		});
		expect(offset).toBe(0);
	});

	it('centers middle periods within the viewport', () => {
		// Period 4: top = 3 * 88 = 264, height = 88, center = 308
		// ideal = 308 - 300 = 8
		const offset4 = calculatePeriodOffsetByIndex({
			periodIndex: 4,
			rowHeightPx: 88,
			viewportHeight: 600,
			scrollHeight: 1056
		});
		expect(offset4).toBe(8);

		// Period 6: top = 5 * 88 = 440, height = 88, center = 484
		// ideal = 484 - 300 = 184
		const offset6 = calculatePeriodOffsetByIndex({
			periodIndex: 6,
			rowHeightPx: 88,
			viewportHeight: 600,
			scrollHeight: 1056
		});
		expect(offset6).toBe(184);
	});

	it('clamps to maxScroll for periods near the bottom', () => {
		// Period 12: top = 11 * 88 = 968, height = 88, center = 1012
		// ideal = 1012 - 300 = 712
		// maxScroll = 1056 - 600 = 456
		const offset12 = calculatePeriodOffsetByIndex({
			periodIndex: 12,
			rowHeightPx: 88,
			viewportHeight: 600,
			scrollHeight: 1056
		});
		expect(offset12).toBe(456);
	});

	it('handles edge cases gracefully', () => {
		expect(
			calculatePeriodCenterScrollOffset({
				periodTop: 100,
				periodHeight: 0,
				viewportHeight: 600
			})
		).toBe(0);

		expect(
			calculatePeriodCenterScrollOffset({
				periodTop: 100,
				periodHeight: 88,
				viewportHeight: 0
			})
		).toBe(0);

		expect(
			calculatePeriodOffsetByIndex({
				periodIndex: 0,
				rowHeightPx: 88,
				viewportHeight: 600
			})
		).toBe(0);
	});
});
