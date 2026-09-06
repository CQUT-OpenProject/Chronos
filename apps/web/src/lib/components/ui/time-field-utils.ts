import { Time } from '@internationalized/date';
import { parseTimeMinutesStrict } from '@chronos/core';

export function parseTimeString(value: string): Time | undefined {
	const total = parseTimeMinutesStrict(value);
	if (total === undefined) return undefined;
	return new Time(Math.floor(total / 60), total % 60);
}

export function timeToString(value: { hour: number; minute: number } | undefined): string {
	if (!value) return '';
	return `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
}
