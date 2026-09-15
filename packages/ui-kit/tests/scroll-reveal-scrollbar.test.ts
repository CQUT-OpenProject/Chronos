import { describe, expect, it } from 'vite-plus/test';
import {
	computeScrollThumbMetrics,
	splitScrollLayoutClasses
} from '../src/actions/scroll-reveal-scrollbar';

describe('computeScrollThumbMetrics', () => {
	it('hides thumb when content does not overflow', () => {
		expect(computeScrollThumbMetrics(0, 100, 200)).toEqual({
			visible: false,
			height: 0,
			offset: 0
		});
	});

	it('computes thumb size and offset for scrollable content', () => {
		const metrics = computeScrollThumbMetrics(50, 400, 200);
		expect(metrics.visible).toBe(true);
		expect(metrics.height).toBeGreaterThanOrEqual(24);
		expect(metrics.offset).toBeGreaterThan(0);
	});
});

describe('splitScrollLayoutClasses', () => {
	it('moves flex sizing classes to the scroll host', () => {
		const result = splitScrollLayoutClasses([
			'secondary-scroll',
			'mx-auto',
			'min-h-0',
			'w-full',
			'max-w-lg',
			'flex-1',
			'flex',
			'flex-col',
			'gap-5',
			'overflow-y-auto',
			'p-4'
		]);

		expect(result.hostClasses).toEqual(['mx-auto', 'min-h-0', 'w-full', 'max-w-lg', 'flex-1']);
		expect(result.scrollClasses).toEqual([
			'secondary-scroll',
			'flex',
			'flex-col',
			'gap-5',
			'overflow-y-auto',
			'p-4'
		]);
	});
});
