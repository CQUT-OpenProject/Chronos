import { parseTimeMinutesStrict } from '@chronos/core';

export interface TimeValue {
	hour: number;
	minute: number;
}

export interface TimePickerLabels {
	placeholder: string;
	hour: string;
	minute: string;
	cancel: string;
	confirm: string;
	triggerEmpty: (label: string) => string;
	triggerLabeled: (label: string, display: string) => string;
	columnAria: (label: string, column: string) => string;
}

export const DEFAULT_TIME_PICKER_LABELS: TimePickerLabels = {
	placeholder: '选择时间',
	hour: '时',
	minute: '分',
	cancel: '取消',
	confirm: '确定',
	triggerEmpty: (label) => `选择${label}`,
	triggerLabeled: (label, display) => `${label}：${display}`,
	columnAria: (label, column) => `${label}${column}`
};

/** Strict 'HH:MM' parse; undefined for dirty input. */
export function parseTimeValue(value: unknown): TimeValue | undefined {
	const total = parseTimeMinutesStrict(value);
	if (total === undefined) return undefined;
	return { hour: Math.floor(total / 60), minute: total % 60 };
}

export function formatTimeValue(value: TimeValue): string {
	return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
}

export function isValidTimeValue(value: unknown): boolean {
	return parseTimeValue(value) !== undefined;
}

export function hourItems(): number[] {
	return Array.from({ length: 24 }, (_, i) => i);
}

export function minuteItems(): number[] {
	return Array.from({ length: 60 }, (_, i) => i);
}

export const TIME_WHEEL_ROW_HEIGHT = 40;

/** Map scroll offset to a snapped wheel index (0..maxIndex). */
export function snapTimeWheelIndex(
	scrollTop: number,
	maxIndex: number,
	rowHeight = TIME_WHEEL_ROW_HEIGHT
): number {
	return Math.min(Math.max(Math.round(scrollTop / rowHeight), 0), maxIndex);
}
