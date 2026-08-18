import type { PeriodTime } from '$lib/models/timetable';

const MIN_TIME_REFRESH_DELAY_MILLIS = 1_000;

export interface ParsedPeriodRange {
	index: number;
	startMinutes: number;
	endMinutes: number;
}

export function parsePeriodRanges(periods: PeriodTime[]): ParsedPeriodRange[] {
	return [...periods]
		.map((period) => ({
			index: period.index,
			startMinutes: parseTimeMinutes(period.startTime),
			endMinutes: parseTimeMinutes(period.endTime)
		}))
		.sort((left, right) => left.index - right.index);
}

export function findCurrentPeriodIndex(
	periods: ParsedPeriodRange[],
	nowMinutes: number
): number | null {
	const active = periods.find(
		(period) => nowMinutes >= period.startMinutes && nowMinutes <= period.endMinutes
	);
	if (active) return active.index;

	const upcoming = periods.find((period) => nowMinutes < period.startMinutes);
	if (upcoming) return upcoming.index;

	return periods.at(-1)?.index ?? null;
}

export function computeDelayUntilNextCurrentTimeRefreshMillis(
	now: Date,
	periods: ParsedPeriodRange[],
	minimumDelayMillis = MIN_TIME_REFRESH_DELAY_MILLIS
): number {
	const nowMinutes = now.getHours() * 60 + now.getMinutes();
	const nextBoundaryToday = periods.reduce<number | null>((found, period) => {
		if (found != null) return found;
		if (nowMinutes >= period.startMinutes && nowMinutes <= period.endMinutes) {
			return period.endMinutes;
		}
		if (nowMinutes < period.startMinutes) {
			return period.startMinutes;
		}
		return null;
	}, null);

	const nextBoundary =
		nextBoundaryToday != null
			? boundaryToDate(now, nextBoundaryToday, nowMinutes)
			: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

	return Math.max(nextBoundary.getTime() - now.getTime(), minimumDelayMillis);
}

export function currentTimeMinutes(date: Date): number {
	return date.getHours() * 60 + date.getMinutes();
}

function parseTimeMinutes(value: string): number {
	const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
	if (!match) return 0;
	return Number(match[1]) * 60 + Number(match[2]);
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
