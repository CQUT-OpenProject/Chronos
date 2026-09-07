import { formatFullDate } from '@chronos/core';

export function formatPublishedDate(value: string): string {
	if (!value) return '-';
	const [year, month, day] = value.split('-');
	if (!year || !month || !day) return value;
	return formatFullDate(value);
}
