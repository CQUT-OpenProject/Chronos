import { describe, expect, it } from 'vite-plus/test';
import { weekFromClientX } from './week-slider-gesture.svelte';

describe('weekFromClientX', () => {
	it('maps clientX across the header width to week numbers', () => {
		expect(
			weekFromClientX({
				clientX: 0,
				rectLeft: 0,
				rectWidth: 100,
				startWeek: 1,
				endWeek: 10
			})
		).toBe(1);

		expect(
			weekFromClientX({
				clientX: 100,
				rectLeft: 0,
				rectWidth: 100,
				startWeek: 1,
				endWeek: 10
			})
		).toBe(10);

		expect(
			weekFromClientX({
				clientX: 50,
				rectLeft: 0,
				rectWidth: 100,
				startWeek: 1,
				endWeek: 10
			})
		).toBe(6);
	});

	it('returns null when rect width is zero', () => {
		expect(
			weekFromClientX({
				clientX: 50,
				rectLeft: 0,
				rectWidth: 0,
				startWeek: 1,
				endWeek: 10
			})
		).toBeNull();
	});
});
