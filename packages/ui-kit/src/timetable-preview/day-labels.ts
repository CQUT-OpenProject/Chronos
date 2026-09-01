import { truncateHolidayLabel } from '@chronos/core';

const DAY_SUFFIXES = ['', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type HostDayLabelTranslate = (key: string) => string;

function resolveDayKey(
	dayOfWeek: number,
	variant: 'full' | 'short'
):
	| `timetable.day.${(typeof DAY_SUFFIXES)[number]}`
	| `timetable.dayShort.${(typeof DAY_SUFFIXES)[number]}`
	| null {
	const suffix = DAY_SUFFIXES[dayOfWeek];
	if (!suffix) return null;
	return `${variant === 'full' ? 'timetable.day.' : 'timetable.dayShort.'}${suffix}`;
}

export function timetableDayLabel(dayOfWeek: number, t: HostDayLabelTranslate): string {
	const key = resolveDayKey(dayOfWeek, 'full');
	if (!key) return dayOfWeek === 0 ? '' : t('timetable.day.unknown');
	return t(key);
}

export function timetableDayShortLabel(dayOfWeek: number, t: HostDayLabelTranslate): string {
	const key = resolveDayKey(dayOfWeek, 'short');
	if (!key) return dayOfWeek === 0 ? '' : '?';
	return t(key);
}

export function timetableDayColumnHeaderLabel(
	day: {
		dayOfWeek: number;
		holiday?: { label: string };
	},
	t: HostDayLabelTranslate
): string {
	if (day.holiday) return truncateHolidayLabel(day.holiday.label);
	return timetableDayShortLabel(day.dayOfWeek, t);
}
