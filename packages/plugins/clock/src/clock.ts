import { todayIsoDate } from '@chronos/core';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface ClockTimeValue {
	hour: number;
	minute: number;
}

export function parseStoredFrozenEpoch(value: unknown): number | null {
	if (typeof value !== 'number' || !Number.isFinite(value)) return null;
	return value;
}

export function combineLocalDateTime(isoDate: string, time: ClockTimeValue): Date | null {
	if (!ISO_DATE.test(isoDate)) return null;
	if (!Number.isInteger(time.hour) || time.hour < 0 || time.hour > 23) return null;
	if (!Number.isInteger(time.minute) || time.minute < 0 || time.minute > 59) return null;
	const year = Number(isoDate.slice(0, 4));
	const month = Number(isoDate.slice(5, 7));
	const day = Number(isoDate.slice(8, 10));
	const next = new Date(year, month - 1, day, time.hour, time.minute, 0, 0);
	if (next.getFullYear() !== year || next.getMonth() !== month - 1 || next.getDate() !== day) {
		return null;
	}
	return next;
}

export function partsFromDate(date: Date): { isoDate: string; time: ClockTimeValue } {
	return {
		isoDate: todayIsoDate(date),
		time: { hour: date.getHours(), minute: date.getMinutes() }
	};
}
