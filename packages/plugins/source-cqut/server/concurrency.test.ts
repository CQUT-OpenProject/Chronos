import { describe, expect, it } from 'vite-plus/test';
import { mapWithConcurrency } from './concurrency';

describe('mapWithConcurrency', () => {
	it('preserves result order with limited concurrency', async () => {
		const items = [1, 2, 3, 4, 5];
		const results = await mapWithConcurrency(items, 2, async (item) => item * 2);
		expect(results).toEqual([2, 4, 6, 8, 10]);
	});
});
