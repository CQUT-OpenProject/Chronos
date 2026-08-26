import { describe, expect, it } from 'vite-plus/test';
import { parseTimeString, timeToString } from './time-field-utils';

describe('time-field-utils', () => {
	it('parseTimeString accepts valid HH:mm values', () => {
		const value = parseTimeString('08:30');
		expect(value).toBeDefined();
		expect(value?.hour).toBe(8);
		expect(value?.minute).toBe(30);
	});

	it('parseTimeString rejects invalid values', () => {
		expect(parseTimeString('')).toBeUndefined();
		expect(parseTimeString('8:3')).toBeUndefined();
		expect(parseTimeString('24:00')).toBeUndefined();
		expect(parseTimeString('12:60')).toBeUndefined();
	});

	it('timeToString zero-pads hours and minutes', () => {
		expect(timeToString(parseTimeString('9:05'))).toBe('09:05');
		expect(timeToString(undefined)).toBe('');
	});
});
