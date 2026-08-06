import { currentWeekMonday } from '$lib/models/defaults';
import type { AcademicConfig } from '$lib/models/timetable';
import {
	addDays,
	addWeeks,
	formatIsoDate,
	isBefore,
	parseIsoDate,
	previousOrSameMonday,
	safeParseIsoDate,
	weeksBetween
} from '../date';

export class AcademicCalendarService {
	normalizeTermStartDate(raw: string, referenceDate: string): string {
		const fallback = parseIsoDate(currentWeekMonday(referenceDate));
		const parsed = safeParseIsoDate(raw, fallback);
		return formatIsoDate(previousOrSameMonday(parsed));
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
