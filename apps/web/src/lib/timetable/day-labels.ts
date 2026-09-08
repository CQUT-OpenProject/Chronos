import type { HostMessageKey } from '$lib/i18n/host-messages';
import { hostT } from '$lib/i18n/host-i18n.svelte';
import {
	timetableDayColumnHeaderLabel as uiDayColumnHeaderLabel,
	timetableDayLabel as uiDayLabel,
	timetableDayShortLabel as uiDayShortLabel
} from '@chronos/ui-kit';

const translate = (key: string) => hostT(key as HostMessageKey);

export function timetableDayLabel(dayOfWeek: number): string {
	return uiDayLabel(dayOfWeek, translate);
}

export function timetableDayShortLabel(dayOfWeek: number): string {
	return uiDayShortLabel(dayOfWeek, translate);
}

export function timetableDayColumnHeaderLabel(day: {
	dayOfWeek: number;
	holiday?: { label: string };
}): string {
	return uiDayColumnHeaderLabel(day, translate);
}
