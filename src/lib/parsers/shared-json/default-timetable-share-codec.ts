import { currentWeekMonday } from '$lib/models/defaults';
import type { Course } from '$lib/models/course';
import type {
	OnlineScheduleCampusContext,
	OnlineScheduleEvent,
	OnlineSchedulePayload,
	OnlineScheduleWeekDay
} from '$lib/models/online-schedule';
import { parseOnlineSchedulePayload } from '$lib/models/online-schedule-schema';
import {
	TimetableImportSource,
	normalizeTimetableName,
	type Timetable,
	type TimetableImportMetadata
} from '$lib/models/timetable';
import type { TimetableShareCodec } from '$lib/domain/interfaces/timetable-share-codec';
import { AcademicCalendarService } from '$lib/domain/services/academic-calendar';
import { SystemTimeProvider, type TimeProvider } from '$lib/domain/services/time-provider';
import {
	addDays,
	addWeeks,
	formatIsoDate,
	parseIsoDate,
	previousOrSameMonday,
	safeParseIsoDate
} from '$lib/domain/date';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { coursePalette, normalizedCourseName } from '$lib/parsers/course-palette';
import { consolidateCourses, sanitizeEventFields } from '$lib/parsers/import-course-utils';

const ACADEMIC_YEAR_PATTERN = /(20\d{2})\D+(20\d{2})/;

interface ImportWeekDayInfo {
	dayOfWeek: number;
	month: number;
	day: number;
}

export class DefaultTimetableShareCodec implements TimetableShareCodec {
	constructor(
		private readonly academicCalendarService = new AcademicCalendarService(),
		private readonly timeProvider: TimeProvider = new SystemTimeProvider()
	) {}

	decode(json: string): AppResult<OnlineSchedulePayload> {
		try {
			return success(parseOnlineSchedulePayload(json));
		} catch {
			return failure(AppError.dataFormat('分享链接解析失败'));
		}
	}

	toTimetable(
		payload: OnlineSchedulePayload,
		campusContext?: OnlineScheduleCampusContext
	): AppResult<Timetable> {
		const yearTerm = payload.yearTerm.trim();
		const courses = consolidateCourses(
			payload.eventList
				.map((event, index) => this.toCourseOrNull(event, index, yearTerm))
				.filter((course): course is Course => course != null)
		);

		if (courses.length === 0) {
			return failure(AppError.validation('分享链接中未找到可导入的课程数据'));
		}

		const now = this.timeProvider.currentTimeMillis();
		const today = this.timeProvider.today();
		const maxWeek = Math.max(
			20,
			Math.max(
				...payload.weekList
					.map((week) => Number.parseInt(week, 10))
					.filter((week) => !Number.isNaN(week)),
				...courses.flatMap((course) => course.weeks)
			)
		);

		const importSource =
			this.toTimetableImportSource(payload.importSource) ?? TimetableImportSource.SHARED_JSON;
		const campusId = campusContext?.campusId;
		const campusPeriodTimes: TimetableImportMetadata['campusPeriodTimes'] | undefined =
			campusContext?.campusPeriodTimes
				? (Object.fromEntries(
						Object.entries(campusContext.campusPeriodTimes).map(([campus, periods]) => [
							campus,
							periods.map((period) => ({ ...period }))
						])
					) as TimetableImportMetadata['campusPeriodTimes'])
				: undefined;
		const periodTimes =
			campusId && campusPeriodTimes
				? (campusPeriodTimes[campusId] ?? []).map((period) => ({ ...period }))
				: [];

		return success({
			id: 'online-import',
			name: normalizeTimetableName(payload.yearTerm),
			courses: [...courses].sort(
				(left, right) =>
					left.dayOfWeek - right.dayOfWeek ||
					left.startPeriod - right.startPeriod ||
					left.name.localeCompare(right.name)
			),
			createdAt: now,
			updatedAt: now,
			academicConfig: {
				termStartDate: this.resolveImportedTermStartDate(payload, today),
				startWeek: 1,
				endWeek: maxWeek,
				periodTimes
			},
			importMetadata: {
				source: importSource,
				campusId,
				campusPeriodTimes
			},
			viewPrefs: {
				showSaturday: courses.some((course) => course.dayOfWeek === 6),
				showSunday: courses.some((course) => course.dayOfWeek === 7),
				showNonCurrentWeekCourses: false
			}
		});
	}

	private resolveImportedTermStartDate(
		payload: OnlineSchedulePayload,
		referenceDate: string
	): string {
		const source = this.toTimetableImportSource(payload.importSource);
		const inferred =
			source === TimetableImportSource.ONLINE_EDU
				? this.inferImportedTermStartDate(payload, referenceDate)
				: ((payload.termStartDate?.trim()
						? this.parseImportedTermStartDate(payload.termStartDate.trim())
						: null) ?? this.inferImportedTermStartDate(payload, referenceDate));

		return this.academicCalendarService.normalizeTermStartDate(
			inferred ?? currentWeekMonday(referenceDate),
			referenceDate
		);
	}

	private parseImportedTermStartDate(value: string): string | null {
		try {
			return formatIsoDate(parseIsoDate(value));
		} catch {
			return null;
		}
	}

	private inferImportedTermStartDate(
		payload: OnlineSchedulePayload,
		referenceDate: string
	): string | null {
		const currentWeek = Number.parseInt(payload.weekNum.trim(), 10);
		if (!currentWeek || currentWeek <= 0) return null;

		const weekDays = payload.weekDayList
			.map((day) => this.toImportWeekDayInfo(day))
			.filter((day): day is ImportWeekDayInfo => day != null);
		const anchor = weekDays.find((day) => day.dayOfWeek === 1) ?? weekDays[0];
		if (!anchor) return null;

		const anchorYear = this.inferImportWeekDateYear(
			anchor.month,
			anchor.day,
			payload.yearTerm,
			referenceDate
		);
		if (!anchorYear) return null;

		const anchorDate = safeParseIsoDate(
			`${anchorYear}-${String(anchor.month).padStart(2, '0')}-${String(anchor.day).padStart(2, '0')}`,
			parseIsoDate(referenceDate)
		);
		const weekStart = addDays(anchorDate, -(anchor.dayOfWeek - 1));
		const termStart = previousOrSameMonday(addWeeks(weekStart, -(currentWeek - 1)));
		return formatIsoDate(termStart);
	}

	private toImportWeekDayInfo(day: OnlineScheduleWeekDay): ImportWeekDayInfo | null {
		const dayOfWeek = this.toImportDayOfWeek(day.weekDay);
		const monthDay = this.toImportMonthDay(day.weekDate);
		if (!dayOfWeek || !monthDay) return null;
		return { dayOfWeek, month: monthDay.month, day: monthDay.day };
	}

	private inferImportWeekDateYear(
		month: number,
		day: number,
		yearTerm: string,
		referenceDate: string
	): number | null {
		const academicYears = this.parseAcademicYears(yearTerm);
		if (academicYears) {
			const [firstYear, secondYear] = academicYears;
			const primaryYear = month >= 8 && month <= 12 ? firstYear : secondYear;
			if (this.isValidDate(primaryYear, month, day)) return primaryYear;
			const secondaryYear = primaryYear === firstYear ? secondYear : firstYear;
			if (this.isValidDate(secondaryYear, month, day)) return secondaryYear;
		}

		const reference = parseIsoDate(referenceDate);
		const candidates = [
			reference.getUTCFullYear() - 1,
			reference.getUTCFullYear(),
			reference.getUTCFullYear() + 1
		]
			.map((year) =>
				safeParseIsoDate(
					`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
					reference
				)
			)
			.filter((date) => date.getUTCMonth() + 1 === month && date.getUTCDate() === day);

		if (candidates.length === 0) return null;
		return candidates
			.reduce((closest, candidate) =>
				Math.abs(candidate.getTime() - reference.getTime()) <
				Math.abs(closest.getTime() - reference.getTime())
					? candidate
					: closest
			)
			.getUTCFullYear();
	}

	private parseAcademicYears(yearTerm: string): [number, number] | null {
		const match = ACADEMIC_YEAR_PATTERN.exec(yearTerm);
		if (!match) return null;
		const firstYear = Number.parseInt(match[1] ?? '', 10);
		const secondYear = Number.parseInt(match[2] ?? '', 10);
		if (Number.isNaN(firstYear) || Number.isNaN(secondYear)) return null;
		return [firstYear, secondYear];
	}

	private isValidDate(year: number, month: number, day: number): boolean {
		const date = new Date(Date.UTC(year, month - 1, day, 12));
		return (
			date.getUTCFullYear() === year &&
			date.getUTCMonth() === month - 1 &&
			date.getUTCDate() === day
		);
	}

	private toImportDayOfWeek(value: string): number | null {
		switch (value.trim().toLowerCase()) {
			case '1':
			case '一':
			case '周一':
			case '星期一':
			case 'mon':
			case 'monday':
				return 1;
			case '2':
			case '二':
			case '周二':
			case '星期二':
			case 'tue':
			case 'tuesday':
				return 2;
			case '3':
			case '三':
			case '周三':
			case '星期三':
			case 'wed':
			case 'wednesday':
				return 3;
			case '4':
			case '四':
			case '周四':
			case '星期四':
			case 'thu':
			case 'thursday':
				return 4;
			case '5':
			case '五':
			case '周五':
			case '星期五':
			case 'fri':
			case 'friday':
				return 5;
			case '6':
			case '六':
			case '周六':
			case '星期六':
			case 'sat':
			case 'saturday':
				return 6;
			case '7':
			case '日':
			case '天':
			case '周日':
			case '星期日':
			case 'sun':
			case 'sunday':
				return 7;
			default:
				return null;
		}
	}

	private toImportMonthDay(value: string): { month: number; day: number } | null {
		const parts = value.trim().split('/');
		if (parts.length !== 2) return null;
		const month = Number.parseInt(parts[0] ?? '', 10);
		const day = Number.parseInt(parts[1] ?? '', 10);
		if (
			Number.isNaN(month) ||
			Number.isNaN(day) ||
			month < 1 ||
			month > 12 ||
			day < 1 ||
			day > 31
		) {
			return null;
		}
		return { month, day };
	}

	private toCourseOrNull(
		event: OnlineScheduleEvent,
		index: number,
		yearTerm: string
	): Course | null {
		const sanitized = sanitizeEventFields(event, yearTerm);
		const normalizedName = normalizedCourseName(sanitized.eventName);
		const dayOfWeek = this.toImportDayOfWeek(sanitized.weekDay);
		const startPeriod = Number.parseInt(sanitized.sessionStart.trim(), 10);
		if (!dayOfWeek || Number.isNaN(startPeriod) || !normalizedName) return null;

		const duration = Number.parseInt(sanitized.sessionLast.trim(), 10);
		const weeks = [
			...new Set(
				sanitized.weekList
					.map((week) => Number.parseInt(week, 10))
					.filter((week) => !Number.isNaN(week))
			)
		].sort((left, right) => left - right);
		const [background, foreground] = coursePalette(normalizedName);
		const sessionMax = sanitized.sessionList
			.map((session) => Number.parseInt(session.trim(), 10))
			.filter((session) => !Number.isNaN(session))
			.reduce((max, session) => Math.max(max, session), Number.NEGATIVE_INFINITY);
		const endPeriod = Number.isFinite(sessionMax)
			? sessionMax
			: !Number.isNaN(duration) && duration >= 1
				? startPeriod + duration - 1
				: startPeriod;

		return {
			id: sanitized.eventID.trim() || `online-course-${index + 1}`,
			name: normalizedName,
			teacher: sanitized.memberName.trim(),
			location: sanitized.address.trim(),
			dayOfWeek,
			startPeriod,
			endPeriod: Math.max(startPeriod, endPeriod),
			color: background,
			textColor: foreground,
			weeks,
			remark: sanitized.remark.trim()
		};
	}

	private toTimetableImportSource(value: string): TimetableImportSource | null {
		const normalized = value.trim().toUpperCase();
		return (Object.values(TimetableImportSource) as string[]).includes(normalized)
			? (normalized as TimetableImportSource)
			: null;
	}
}
