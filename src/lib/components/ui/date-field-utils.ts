import { parseDate, type DateValue } from '@internationalized/date';
import { formatSlashDate } from '$lib/domain/date';

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
