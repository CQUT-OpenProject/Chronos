import { currentWeekMonday } from '$lib/models/defaults';
import type { Course } from '$lib/models/course';
import type {
	OnlineScheduleEvent,
	OnlineSchedulePayload,
	OnlineScheduleWeekDay
} from '$lib/models/online-schedule';
import {
	encodeOnlineSchedulePayload,
	parseOnlineSchedulePayload
} from '$lib/models/online-schedule-schema';
import { TimetableImportSource, type Timetable } from '$lib/models/timetable';
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
			return failure(AppError.dataFormat('在线课表 JSON 解析失败'));
		}
	}

	encode(timetable: Timetable): AppResult<string> {
		try {
			return success(encodeOnlineSchedulePayload(this.toOnlinePayload(timetable)));
		} catch {
			return failure(AppError.dataFormat('课表导出失败'));
		}
	}

	toTimetable(payload: OnlineSchedulePayload): AppResult<Timetable> {
		const courses = payload.eventList
			.map((event, index) => this.toCourseOrNull(event, index))
			.filter((course): course is Course => course != null);

		if (courses.length === 0) {
			return failure(AppError.validation('JSON 中未找到可导入的课程数据'));
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

		return success({
			id: 'online-import',
			name: payload.yearTerm.trim() || '在线课表',
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
				periodTimes: []
			},
			importMetadata: {
				source:
					this.toTimetableImportSource(payload.importSource) ?? TimetableImportSource.SHARED_JSON
			},
			viewPrefs: {
				showSaturday: courses.some((course) => course.dayOfWeek === 6),
				showSunday: courses.some((course) => course.dayOfWeek === 7),
				showNonCurrentWeekCourses: false
			}
		});
	}

	private toOnlinePayload(timetable: Timetable): OnlineSchedulePayload {
		const today = this.timeProvider.today();
		const academicWeek = this.academicCalendarService.calculateAcademicWeek(
			today,
			timetable.academicConfig
		);
		const weekStart = this.academicCalendarService.resolveWeekStart(
			timetable.academicConfig,
			academicWeek,
			today
		);
		const weekNum = String(academicWeek);
		const weekList = Array.from(
			{ length: timetable.academicConfig.endWeek - timetable.academicConfig.startWeek + 1 },
			(_, index) => String(timetable.academicConfig.startWeek + index)
		);

		return {
			yearTerm: timetable.name,
			weekNum,
			nowMonth: String(parseIsoDate(weekStart).getUTCMonth() + 1),
			importSource: timetable.importMetadata.source,
			termStartDate: this.exportTermStartDate(
				timetable.importMetadata.source,
				timetable.academicConfig.termStartDate,
				today
			),
			yearTermList: [timetable.name],
			weekList,
			weekDayList: this.buildWeekDayList(today, weekStart),
			eventList: timetable.courses.map((course) => this.toOnlineEvent(course, weekNum))
		};
	}

	private exportTermStartDate(
		importSource: TimetableImportSource,
		termStartDate: string,
		referenceDate: string
	): string | null {
		if (importSource === TimetableImportSource.ONLINE_EDU) return null;
		return this.academicCalendarService.normalizeTermStartDate(termStartDate, referenceDate);
	}

	private buildWeekDayList(referenceDate: string, weekStart: string): OnlineScheduleWeekDay[] {
		const labels = ['一', '二', '三', '四', '五', '六', '日'];
		const start = parseIsoDate(weekStart);
		const today = parseIsoDate(referenceDate);
		return labels.map((weekDay, offset) => {
			const date = addDays(start, offset);
			const month = String(date.getUTCMonth() + 1).padStart(2, '0');
			const day = String(date.getUTCDate()).padStart(2, '0');
			return {
				weekDay,
				weekDate: `${month}/${day}`,
				today: formatIsoDate(date) === formatIsoDate(today)
			};
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

	private toCourseOrNull(event: OnlineScheduleEvent, index: number): Course | null {
		const normalizedName = normalizedCourseName(event.eventName);
		const dayOfWeek = this.toImportDayOfWeek(event.weekDay);
		const startPeriod = Number.parseInt(event.sessionStart.trim(), 10);
		if (!dayOfWeek || Number.isNaN(startPeriod) || !normalizedName) return null;

		const duration = Number.parseInt(event.sessionLast.trim(), 10);
		const weeks = [
			...new Set(
				event.weekList
					.map((week) => Number.parseInt(week, 10))
					.filter((week) => !Number.isNaN(week))
			)
		].sort((left, right) => left - right);
		const [background, foreground] = coursePalette(normalizedName);
		const sessionMax = event.sessionList
			.map((session) => Number.parseInt(session.trim(), 10))
			.filter((session) => !Number.isNaN(session))
			.reduce((max, session) => Math.max(max, session), Number.NEGATIVE_INFINITY);
		const endPeriod = Number.isFinite(sessionMax)
			? sessionMax
			: !Number.isNaN(duration) && duration >= 1
				? startPeriod + duration - 1
				: startPeriod;

		return {
			id: event.eventID.trim() || `online-course-${index + 1}`,
			name: normalizedName,
			teacher: event.memberName.trim(),
			location: event.address.trim(),
			dayOfWeek,
			startPeriod,
			endPeriod: Math.max(startPeriod, endPeriod),
			color: background,
			textColor: foreground,
			weeks,
			remark: event.remark.trim()
		};
	}

	private toOnlineEvent(course: Course, currentWeek: string): OnlineScheduleEvent {
		return {
			weekNum: currentWeek,
			weekDay: String(course.dayOfWeek),
			weekList: course.weeks.map(String),
			weekCover: this.toWeekCover(course.weeks),
			sessionList: Array.from({ length: course.endPeriod - course.startPeriod + 1 }, (_, index) =>
				String(course.startPeriod + index)
			),
			sessionStart: String(course.startPeriod),
			sessionLast: String(course.endPeriod - course.startPeriod + 1),
			eventName: course.name,
			address: course.location,
			memberName: course.teacher,
			remark: course.remark,
			duplicateGroupType: 'none',
			duplicateGroup: 0,
			eventType: 'course',
			eventID: course.id
		};
	}

	private toWeekCover(weeks: number[]): string {
		if (weeks.length === 0) return '';
		if (weeks.length === 1) return `${weeks[0]}周`;
		return `${weeks[0]}-${weeks[weeks.length - 1]}周`;
	}

	private toTimetableImportSource(value: string): TimetableImportSource | null {
		const normalized = value.trim().toUpperCase();
		return (Object.values(TimetableImportSource) as string[]).includes(normalized)
			? (normalized as TimetableImportSource)
			: null;
	}
}
