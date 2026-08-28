import type { HostMessageKey } from '$lib/i18n/host-messages';
import { hostT } from '$lib/i18n/host-i18n.svelte';
import { truncateHolidayLabel } from '@chronos/core';

const DAY_SUFFIXES = ['', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function resolveDayKey(dayOfWeek: number, variant: 'full' | 'short'): HostMessageKey | null {
	const suffix = DAY_SUFFIXES[dayOfWeek];
	if (!suffix) return null;
	return `${variant === 'full' ? 'timetable.day.' : 'timetable.dayShort.'}${suffix}` as HostMessageKey;
}

export function timetableDayLabel(dayOfWeek: number): string {
	const key = resolveDayKey(dayOfWeek, 'full');
	if (!key) return dayOfWeek === 0 ? '' : hostT('timetable.day.unknown');
	return hostT(key);
}

export function timetableDayShortLabel(dayOfWeek: number): string {
	const key = resolveDayKey(dayOfWeek, 'short');
	if (!key) return dayOfWeek === 0 ? '' : '?';
	return hostT(key);
}

export function timetableDayColumnHeaderLabel(day: {
	dayOfWeek: number;
	holiday?: { label: string };
}): string {
	if (day.holiday) return truncateHolidayLabel(day.holiday.label);
	return timetableDayShortLabel(day.dayOfWeek);
}
