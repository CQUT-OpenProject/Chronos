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

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

/** Strict 'HH:MM' parse; undefined for dirty input. */
export function parseTimeValue(value: unknown): TimeValue | undefined {
	if (typeof value !== 'string') return undefined;
	const match = TIME_PATTERN.exec(value.trim());
	if (!match) return undefined;
	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined;
	return { hour, minute };
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
