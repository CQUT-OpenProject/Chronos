import { parseDate, type DateValue } from '@internationalized/date';
import { formatSlashDate } from '@chronos/core';

export interface DateFieldLabels {
	placeholder: string;
	today: string;
	clear: string;
	confirm: string;
	triggerEmpty: (label: string) => string;
	triggerLabeled: (label: string, display: string) => string;
}

export const DEFAULT_DATE_FIELD_LABELS: DateFieldLabels = {
	placeholder: '选择日期',
	today: '今天',
	clear: '清除',
	confirm: '确定',
	triggerEmpty: (label) => `选择${label}`,
	triggerLabeled: (label, display) => `${label}：${display}`
};

export function isoToCalendarDate(iso: unknown): DateValue | undefined {
	if (typeof iso !== 'string') return undefined;
	const trimmed = iso.trim();
	if (!trimmed) return undefined;

	try {
		return parseDate(trimmed);
	} catch {
		return undefined;
	}
}

export function isValidIsoDateString(iso: unknown): boolean {
	return isoToCalendarDate(iso) !== undefined;
}

export function calendarDateToIso(value: DateValue | undefined): string {
	if (!value) return '';
	return value.toString();
}

export function formatDateDisplay(iso: unknown): string {
	if (!isValidIsoDateString(iso)) return '';
	return formatSlashDate((iso as string).trim());
}

export function appLocaleToBcp47(locale: string | undefined | null): string {
	return locale?.toLowerCase() === 'en' ? 'en' : 'zh-CN';
}

/** Picker visible month: draft when valid, otherwise the given today ISO. */
export function resolvePickerMonthIso(draftIso: unknown, todayIso: string): string {
	return isValidIsoDateString(draftIso) ? (draftIso as string).trim() : todayIso;
}

export function buildDateFieldTriggerLabel(
	label: string,
	iso: unknown,
	labels: DateFieldLabels = DEFAULT_DATE_FIELD_LABELS
): string {
	const display = formatDateDisplay(iso);
	return display ? labels.triggerLabeled(label, display) : labels.triggerEmpty(label);
}
