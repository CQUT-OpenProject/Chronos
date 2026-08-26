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
	fallback: PeriodLookupFallback = 'upcomingOrLast'
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

export const MIN_TIME_REFRESH_DELAY_MILLIS = 1_000;

export function computeDelayUntilNextCurrentTimeRefreshMillis(
	now: Date,
	periods: ParsedPeriodRange[],
	minimumDelayMillis = MIN_TIME_REFRESH_DELAY_MILLIS
): number {
	const nowMinutes = currentTimeMinutes(now);
	let nextBoundaryToday: number | null = null;
	for (const period of periods) {
		if (nowMinutes >= period.startMinutes && nowMinutes <= period.endMinutes) {
			nextBoundaryToday = period.endMinutes;
			break;
		}
		if (nowMinutes < period.startMinutes) {
			nextBoundaryToday = period.startMinutes;
			break;
		}
	}

	const nextBoundary =
		nextBoundaryToday != null
			? boundaryToDate(now, nextBoundaryToday, nowMinutes)
			: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

	return Math.max(nextBoundary.getTime() - now.getTime(), minimumDelayMillis);
}

function boundaryToDate(now: Date, boundaryMinutes: number, nowMinutes: number): Date {
	const hours = Math.floor(boundaryMinutes / 60);
	const minutes = boundaryMinutes % 60;
	const candidate = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		hours,
		minutes,
		0,
		0
	);
	if (candidate.getTime() <= now.getTime() && boundaryMinutes <= nowMinutes) {
		candidate.setDate(candidate.getDate() + 1);
	}
	return candidate;
}
