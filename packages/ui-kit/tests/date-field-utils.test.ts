import { parseDate } from '@internationalized/date';
import { describe, expect, it } from 'vite-plus/test';
import {
	appLocaleToBcp47,
	buildDateFieldTriggerLabel,
	calendarDateToIso,
	formatDateDisplay,
	isValidIsoDateString,
	isoToCalendarDate,
	resolvePickerMonthIso
} from '../src/form/date-field-utils';

describe('ui-kit date-field-utils', () => {
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

	it('treats invalid ISO strings as empty instead of rendering garbage', () => {
		expect(formatDateDisplay('foo')).toBe('');
		expect(formatDateDisplay('2026-02')).toBe('');
		expect(formatDateDisplay('2026-13-40')).toBe('');
		expect(buildDateFieldTriggerLabel('学期起始日', 'foo')).toBe('选择学期起始日');
		expect(isValidIsoDateString('2026-02-23')).toBe(true);
		expect(isValidIsoDateString('foo')).toBe(false);
		expect(isValidIsoDateString('')).toBe(false);
		expect(isValidIsoDateString(undefined)).toBe(false);
		expect(isValidIsoDateString(123)).toBe(false);
	});

	it('tolerates non-string input without throwing', () => {
		expect(isoToCalendarDate(undefined)).toBeUndefined();
		expect(isoToCalendarDate(123)).toBeUndefined();
		expect(formatDateDisplay(undefined)).toBe('');
	});

	it('maps app locales to BCP-47 tags', () => {
		expect(appLocaleToBcp47('en')).toBe('en');
		expect(appLocaleToBcp47('zh-cn')).toBe('zh-CN');
		expect(appLocaleToBcp47(undefined)).toBe('zh-CN');
	});

	it('resolves the picker month from the draft, falling back to today', () => {
		expect(resolvePickerMonthIso('2020-01-15', '2026-09-05')).toBe('2020-01-15');
		expect(resolvePickerMonthIso('', '2026-09-05')).toBe('2026-09-05');
		expect(resolvePickerMonthIso('foo', '2026-09-05')).toBe('2026-09-05');
	});
});
