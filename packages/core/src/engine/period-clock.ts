import type { PeriodTime } from '../domain/timetable';

export type PeriodLookupFallback = 'none' | 'upcomingOrLast';

export interface ParsedPeriodRange {
	index: number;
	startMinutes: number;
	endMinutes: number;
}

export function parseTimeMinutes(value: string): number {
	const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
	if (!match) return 0;
	return Number(match[1]) * 60 + Number(match[2]);
}

export function parsePeriodRanges(periods: PeriodTime[]): ParsedPeriodRange[] {
	return periods
		.map((period) => ({
			index: period.index,
			startMinutes: parseTimeMinutes(period.startTime),
			endMinutes: parseTimeMinutes(period.endTime)
		}))
		.sort((left, right) => left.index - right.index);
}

export function currentTimeMinutes(date: Date): number {
	return date.getHours() * 60 + date.getMinutes();
}

export function findCurrentPeriodIndex(
	periods: ParsedPeriodRange[],
	nowMinutes: number,
	fallback: PeriodLookupFallback = 'none'
): number | null {
	let upcomingIndex: number | null = null;
	for (const period of periods) {
		if (nowMinutes >= period.startMinutes && nowMinutes <= period.endMinutes) {
			return period.index;
		}
		if (upcomingIndex == null && nowMinutes < period.startMinutes) {
			upcomingIndex = period.index;
		}
	}

	if (fallback === 'none') return null;
	return upcomingIndex ?? periods.at(-1)?.index ?? null;
}
