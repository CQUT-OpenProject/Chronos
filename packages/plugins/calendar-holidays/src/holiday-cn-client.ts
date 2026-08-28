import type { CalendarHoliday } from '@chronos/core';
import type { IHttpService } from '@chronos/core';
import { HOLIDAY_CN_CDN_BASE } from './constants';
import fallback2025 from '../static/data/2025.json';
import fallback2026 from '../static/data/2026.json';
import fallback2027 from '../static/data/2027.json';

export interface HolidayCnDay {
	name: string;
	date: string;
	isOffDay: boolean;
}

export interface HolidayCnYearPayload {
	year: number;
	papers: string[];
	days: HolidayCnDay[];
}

const FALLBACK_BY_YEAR: Record<number, HolidayCnYearPayload> = {
	2025: fallback2025 as HolidayCnYearPayload,
	2026: fallback2026 as HolidayCnYearPayload,
	2027: fallback2027 as HolidayCnYearPayload
};

export function parseHolidayCnOffDays(payload: HolidayCnYearPayload): CalendarHoliday[] {
	return payload.days
		.filter((day) => day.isOffDay)
		.map((day) => ({ date: day.date, label: day.name }));
}

export async function fetchHolidayCnYear(
	http: IHttpService,
	year: number
): Promise<HolidayCnYearPayload | null> {
	const url = `${HOLIDAY_CN_CDN_BASE}/${year}.json`;
	try {
		const response = await http.request(url, { method: 'GET', timeoutMs: 15_000 });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		return await response.json<HolidayCnYearPayload>();
	} catch (error) {
		const fallback = FALLBACK_BY_YEAR[year];
		if (fallback) {
			return fallback;
		}
		console.warn(`[calendar-holidays] No holiday-cn data for ${year}`, error);
		return null;
	}
}

export async function fetchHolidayCnYears(
	http: IHttpService,
	years: readonly number[]
): Promise<{ holidays: CalendarHoliday[] }> {
	const payloads = (await Promise.all(years.map((year) => fetchHolidayCnYear(http, year)))).filter(
		(payload): payload is HolidayCnYearPayload => payload !== null
	);

	if (payloads.length === 0) {
		throw new Error(`No holiday-cn data for years: ${years.join(', ')}`);
	}

	const holidays = payloads.flatMap((payload) => parseHolidayCnOffDays(payload));
	const byDate = new Map<string, CalendarHoliday>();
	for (const holiday of holidays) {
		if (!byDate.has(holiday.date)) {
			byDate.set(holiday.date, holiday);
		}
	}
	return {
		holidays: [...byDate.values()].sort((left, right) => left.date.localeCompare(right.date))
	};
}
