export function parseIsoDate(value: string): Date {
	const trimmed = value.trim();
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
	if (!match) {
		throw new Error(`Invalid ISO date: ${value}`);
	}
	const [, year, month, day] = match;
	return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));
}

export function formatIsoDate(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function formatSlashDate(iso: string): string {
	const [year, month, day] = iso.split('-');
	return `${year}/${Number(month)}/${Number(day)}`;
}

export function previousOrSameMonday(date: Date): Date {
	const result = new Date(date.getTime());
	const day = result.getUTCDay();
	const diff = day === 0 ? -6 : 1 - day;
	result.setUTCDate(result.getUTCDate() + diff);
	return result;
}

export function addDays(date: Date, days: number): Date {
	const result = new Date(date.getTime());
	result.setUTCDate(result.getUTCDate() + days);
	return result;
}

export function addWeeks(date: Date, weeks: number): Date {
	return addDays(date, weeks * 7);
}

export function weeksBetween(start: Date, end: Date): number {
	const msPerWeek = 7 * 24 * 60 * 60 * 1000;
	return Math.floor((end.getTime() - start.getTime()) / msPerWeek);
}

export function isBefore(left: Date, right: Date): boolean {
	return left.getTime() < right.getTime();
}

export function safeParseIsoDate(value: string, fallback: Date): Date {
	try {
		return parseIsoDate(value);
	} catch {
		return fallback;
	}
}

export function currentWeekMonday(referenceDate: string): string {
	return formatIsoDate(previousOrSameMonday(parseIsoDate(referenceDate)));
}

export function todayIsoDate(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
