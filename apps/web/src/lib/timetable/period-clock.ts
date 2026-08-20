import {
	currentTimeMinutes,
	findCurrentPeriodIndex as findCurrentPeriodIndexCore,
	parsePeriodRanges,
	type ParsedPeriodRange,
	type PeriodLookupFallback
} from '@chronos/core';

const MIN_TIME_REFRESH_DELAY_MILLIS = 1_000;

export type { ParsedPeriodRange, PeriodLookupFallback };
export { parsePeriodRanges, currentTimeMinutes };

export function findCurrentPeriodIndex(
	periods: ParsedPeriodRange[],
	nowMinutes: number,
	fallback: PeriodLookupFallback = 'upcomingOrLast'
): number | null {
	return findCurrentPeriodIndexCore(periods, nowMinutes, fallback);
}

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
