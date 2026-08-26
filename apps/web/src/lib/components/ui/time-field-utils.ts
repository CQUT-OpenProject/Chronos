import { Time } from '@internationalized/date';

const TIME_STRING_PATTERN = /^(\d{1,2}):(\d{2})$/;

export function parseTimeString(value: string): Time | undefined {
	const match = TIME_STRING_PATTERN.exec(value.trim());
	if (!match) return undefined;

	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined;

	return new Time(hour, minute);
}

export function timeToString(value: { hour: number; minute: number } | undefined): string {
	if (!value) return '';
	return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
}
