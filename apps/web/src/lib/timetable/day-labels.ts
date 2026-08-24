import type { ReactiveChronosController } from '@chronos/ui-kit';
import type { HostMessageKey } from '$lib/i18n/host-messages';
import { hostText, hostTextRead } from '$lib/i18n/host-text';

const DAY_SUFFIXES = ['', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function resolveDayKey(dayOfWeek: number, variant: 'full' | 'short'): HostMessageKey | null {
	const suffix = DAY_SUFFIXES[dayOfWeek];
	if (!suffix) return null;
	return `${variant === 'full' ? 'timetable.day.' : 'timetable.dayShort.'}${suffix}` as HostMessageKey;
}

export function timetableDayLabel(dayOfWeek: number): string {
	const key = resolveDayKey(dayOfWeek, 'full');
	if (!key) return dayOfWeek === 0 ? '' : hostText('timetable.day.unknown');
	return hostText(key);
}

export function timetableDayShortLabel(dayOfWeek: number): string {
	const key = resolveDayKey(dayOfWeek, 'short');
	if (!key) return dayOfWeek === 0 ? '' : '?';
	return hostText(key);
}

export function timetableDayLabelRead(
	controller: ReactiveChronosController | undefined,
	dayOfWeek: number
): string {
	const key = resolveDayKey(dayOfWeek, 'full');
	if (!key) return dayOfWeek === 0 ? '' : hostTextRead(controller, 'timetable.day.unknown');
	return hostTextRead(controller, key);
}

export function timetableDayShortLabelRead(
	controller: ReactiveChronosController | undefined,
	dayOfWeek: number
): string {
	const key = resolveDayKey(dayOfWeek, 'short');
	if (!key) return dayOfWeek === 0 ? '' : '?';
	return hostTextRead(controller, key);
}
