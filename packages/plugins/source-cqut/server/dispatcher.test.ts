import { describe, expect, it } from 'vite-plus/test';
import { getCqutDispatcher, resetCqutDispatcher } from './dispatcher';

describe('getCqutDispatcher', () => {
	it('returns a singleton Agent dispatcher instance', () => {
		resetCqutDispatcher();
		const first = getCqutDispatcher();
		const second = getCqutDispatcher();
		expect(first).toBe(second);
	});

	it('creates a new instance after reset', () => {
		const first = getCqutDispatcher();
		resetCqutDispatcher();
		const second = getCqutDispatcher();
		expect(first).not.toBe(second);
	});
});
