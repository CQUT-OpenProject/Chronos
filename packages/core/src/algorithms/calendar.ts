import type { AcademicConfig } from '../domain/timetable';
import {
	addDays,
	addWeeks,
	currentWeekMonday,
	formatIsoDate,
	isBefore,
	parseIsoDate,
	previousOrSameMonday,
	weeksBetween
} from './date';

export class AcademicCalendarService {
	normalizeTermStartDate(raw: string, referenceDate: string): string {
		const fallback = parseIsoDate(currentWeekMonday(referenceDate));
		if (!raw || !raw.trim()) {
			return formatIsoDate(previousOrSameMonday(fallback));
		}
		try {
			const isoParsed = parseIsoDate(raw);
			return formatIsoDate(previousOrSameMonday(isoParsed));
		} catch {
			const termParsed = this.inferTermStartDateFromTermName(raw);
			if (termParsed) {
				return formatIsoDate(previousOrSameMonday(termParsed));
			}
			return formatIsoDate(previousOrSameMonday(fallback));
		}
	}

	inferTermStartDateFromTermName(termName: string): Date | null {
		const match = /(20\d{2})\D+(20\d{2})[^\d]*([12])/.exec(termName);
		if (!match) return null;
		const year1 = Number.parseInt(match[1] ?? '', 10);
		const year2 = Number.parseInt(match[2] ?? '', 10);
		const term = Number.parseInt(match[3] ?? '', 10);
		if (Number.isNaN(year1) || Number.isNaN(year2) || Number.isNaN(term)) return null;

		if (term === 1) {
			return new Date(Date.UTC(year1, 8, 1, 12));
		}
		if (term === 2) {
			return new Date(Date.UTC(year2, 2, 1, 12));
		}
		return null;
	}

	calculateAcademicWeek(today: string, academicConfig?: AcademicConfig | null): number {
		const configured = academicConfig ?? {
			termStartDate: '',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		};
		const termStart = parseIsoDate(this.normalizeTermStartDate(configured.termStartDate, today));
		const todayDate = parseIsoDate(today);

		if (isBefore(todayDate, termStart)) {
			return configured.startWeek;
		}

		const weeks = weeksBetween(termStart, todayDate);
		return Math.min(
			Math.max(configured.startWeek + weeks, configured.startWeek),
			configured.endWeek
		);
	}

	resolveWeekStart(academicConfig: AcademicConfig, week: number, referenceDate: string): string {
		const termStart = parseIsoDate(
			this.normalizeTermStartDate(academicConfig.termStartDate, referenceDate)
		);
		return formatIsoDate(addWeeks(termStart, week - academicConfig.startWeek));
	}

	resolveCourseDate(
		academicConfig: AcademicConfig,
		week: number,
		dayOfWeek: number,
		referenceDate: string
	): string {
		const weekStart = parseIsoDate(this.resolveWeekStart(academicConfig, week, referenceDate));
		return formatIsoDate(addDays(weekStart, dayOfWeek - 1));
	}
}

const fallbackAcademicConfig: AcademicConfig = {
	termStartDate: '',
	startWeek: 1,
	endWeek: 20,
	periodTimes: []
};

export function formatShortDate(iso: string): string {
	const [, month, day] = iso.split('-');
	return `${Number(month)}/${Number(day)}`;
}

export function formatWeekDateRange(
	academicConfig: AcademicConfig | undefined | null,
	week: number,
	today: string,
	viewPrefs?: { showSaturday?: boolean; showSunday?: boolean } | null,
	calendarService: AcademicCalendarService = new AcademicCalendarService()
): string {
	const config = academicConfig ?? fallbackAcademicConfig;
	const startIso = calendarService.resolveWeekStart(config, week, today);
	let days = 5;
	if (viewPrefs?.showSunday) days = 7;
	else if (viewPrefs?.showSaturday) days = 6;
	const startDate = parseIsoDate(startIso);
	const endDate = addDays(startDate, days - 1);
	return `${formatShortDate(startIso)} - ${formatShortDate(formatIsoDate(endDate))}`;
}
