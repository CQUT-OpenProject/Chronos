import { parseDate, type DateValue } from '@internationalized/date';
import { formatSlashDate } from '@chronos/core';
import { hostText } from '$lib/i18n/host-text';

export function isoToCalendarDate(iso: string): DateValue | undefined {
	const trimmed = iso.trim();
	if (!trimmed) return undefined;

	try {
		return parseDate(trimmed);
	} catch {
		return undefined;
	}
}

export function calendarDateToIso(value: DateValue | undefined): string {
	if (!value) return '';
	return value.toString();
}

export function formatDateDisplay(iso: string): string {
	if (!iso.trim()) return '';
	return formatSlashDate(iso);
}

export function buildDateFieldTriggerLabel(label: string, iso: string): string {
	const display = formatDateDisplay(iso);
	return display
		? hostText('ui.date.trigger.labeled', { label, display })
		: hostText('ui.date.trigger.empty', { label });
}
