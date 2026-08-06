import type { PeriodTime } from './timetable';

export function defaultPeriodTimes(): PeriodTime[] {
	return [
		{ index: 1, startTime: '08:30', endTime: '09:15' },
		{ index: 2, startTime: '09:25', endTime: '10:10' },
		{ index: 3, startTime: '10:30', endTime: '11:15' },
		{ index: 4, startTime: '11:25', endTime: '12:10' },
		{ index: 5, startTime: '14:20', endTime: '15:05' },
		{ index: 6, startTime: '15:15', endTime: '16:00' },
		{ index: 7, startTime: '16:20', endTime: '17:05' },
		{ index: 8, startTime: '17:15', endTime: '18:00' },
		{ index: 9, startTime: '19:00', endTime: '19:45' },
		{ index: 10, startTime: '19:50', endTime: '20:35' }
	];
}

export function currentWeekMonday(referenceDate: string): string {
	const date = parseIsoDate(referenceDate);
	const day = date.getUTCDay();
	const diff = day === 0 ? -6 : 1 - day;
	date.setUTCDate(date.getUTCDate() + diff);
	return formatIsoDate(date);
}

function parseIsoDate(value: string): Date {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day, 12));
}

function formatIsoDate(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
