import { describe, expect, it } from 'vite-plus/test';
import {
	formatTimeValue,
	hourItems,
	isValidTimeValue,
	minuteItems,
	parseTimeValue
} from '../src/form/time-wheel-utils';

describe('time-wheel-utils', () => {
	it('parses strict HH:MM strings', () => {
		expect(parseTimeValue('08:45')).toEqual({ hour: 8, minute: 45 });
		expect(parseTimeValue(' 8:05 ')).toEqual({ hour: 8, minute: 5 });
		expect(parseTimeValue('24:00')).toBeUndefined();
		expect(parseTimeValue('8:5')).toBeUndefined();
		expect(parseTimeValue('nope')).toBeUndefined();
		expect(parseTimeValue(undefined)).toBeUndefined();
		expect(isValidTimeValue('08:45')).toBe(true);
		expect(isValidTimeValue('')).toBe(false);
	});

	it('formats zero-padded clock times', () => {
		expect(formatTimeValue({ hour: 8, minute: 5 })).toBe('08:05');
		expect(formatTimeValue({ hour: 0, minute: 0 })).toBe('00:00');
	});

	it('builds full wheel columns', () => {
		expect(hourItems()).toHaveLength(24);
		expect(hourItems()[23]).toBe(23);
		expect(minuteItems()).toHaveLength(60);
		expect(minuteItems()[59]).toBe(59);
	});
});
