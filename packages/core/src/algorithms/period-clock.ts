import type { PeriodTime } from '../domain/timetable';

export type PeriodLookupFallback = 'none' | 'upcomingOrLast';

export interface ParsedPeriodRange {
	index: number;
	startMinutes: number;
	endMinutes: number;
}

export function parseTimeMinutes(value: string): number {
	// Lenient parse for runtime period lookup (invalid input → 0). For editing/forms use parseTimeMinutesStrict.
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

export interface DayClockHandle {
	reschedule(): void;
	dispose(): void;
}

/** One self-scheduling timer, always aligned to the next wall-clock minute. */
export function createDayClock(options: { onTick: (now: Date) => void }): DayClockHandle {
	let timer: ReturnType<typeof setTimeout> | undefined;
	let disposed = false;
	function reschedule() {
		clearTimeout(timer);
		if (disposed) return;
		const now = new Date();
		const delay = 60_000 - (now.getSeconds() * 1_000 + now.getMilliseconds());
		timer = setTimeout(() => {
			if (disposed) return;
			options.onTick(new Date());
			reschedule();
		}, delay);
	}
	reschedule();
	return {
		reschedule,
		dispose() {
			disposed = true;
			clearTimeout(timer);
		}
	};
}
