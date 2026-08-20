import { parseDate } from '@internationalized/date';
import { describe, expect, it } from 'vite-plus/test';
import {
	buildDateFieldTriggerLabel,
	calendarDateToIso,
	formatDateDisplay,
	isoToCalendarDate
} from './date-field-utils';

describe('date-field-utils', () => {
	it('round-trips ISO dates through calendar values', () => {
		const iso = '2026-02-23';
		expect(calendarDateToIso(isoToCalendarDate(iso))).toBe(iso);
		expect(calendarDateToIso(parseDate(iso))).toBe(iso);
	});

	it('formats display dates without leading zeros in month/day', () => {
		expect(formatDateDisplay('2026-02-23')).toBe('2026/2/23');
	});

	it('builds trigger labels for committed and draft values', () => {
		expect(buildDateFieldTriggerLabel('学期起始日', '2026-02-23')).toBe('学期起始日：2026/2/23');
		expect(buildDateFieldTriggerLabel('学期起始日', '')).toBe('选择学期起始日');
	});
});
