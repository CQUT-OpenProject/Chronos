import { describe, expect, it } from 'vite-plus/test';
import { createCqutDispatcher, getCqutDispatcher } from './dispatcher';

describe('getCqutDispatcher', () => {
	it('returns a cached singleton Agent dispatcher instance', () => {
		const first = getCqutDispatcher();
		const second = getCqutDispatcher();
		expect(first).toBe(second);
	});

	it('createCqutDispatcher creates independent dispatcher instances', () => {
		const first = createCqutDispatcher();
		const second = createCqutDispatcher();
		expect(first).not.toBe(second);
	});
});
