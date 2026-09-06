/** CQUT online preview JSON → Chronos timetable domain model. */
import type { Timetable, Course, PeriodTime, AcademicConfig } from '@chronos/core';
import {
	createCourse,
	createTimetable,
	deriveWeekendViewPrefs,
	normalizedCourseName
} from '@chronos/core';
import {
	CQUT_DEFAULT_CAMPUS_PERIOD_TIMES,
	DEFAULT_CQUT_CAMPUS_ID,
	type CqutCampusId
} from './campus-period-times';
import { formatStudentTimetableName } from './messages';

export interface CqutCampusScheduleMetadata {
	campusId?: string;
	campusPeriodTimes?: Record<string, PeriodTime[]>;
	studentId?: string;
}

export interface CqutOnlineEventItem {
	weekNum?: string;
	weekDay: string;
	weekList?: string[];
	sessionList?: string[];
	sessionStart: string;
	sessionLast?: string;
	eventName: string;
	address?: string;
	memberName?: string;
	remark?: string;
	eventID?: string;
}

export interface CqutOnlinePayloadData {
	yearTerm?: string;
	weekNum?: string;
	termStartDate?: string | null;
	weekDayList?: Array<{ weekDay: string; weekDate: string; today?: boolean }>;
	eventList?: CqutOnlineEventItem[];
}

/** Server `/preview` payload fields the CQUT plugin understands. */
export interface CqutScheduleRawInput {
	studentName?: string;
	termName?: string;
	termStartDate?: string;
	campusId?: string;
	campusPeriodTimes?: Record<string, PeriodTime[]>;
	payload?: CqutOnlinePayloadData;
}

function inferCqutTermStartDate(payload: {
	termStartDate?: string | null;
	weekNum?: string;
	yearTerm?: string;
	weekDayList?: Array<{ weekDay: string; weekDate: string }>;
}): string {
	if (payload.termStartDate && /^\d{4}-\d{2}-\d{2}$/.test(payload.termStartDate)) {
		return payload.termStartDate;
	}

	const currentWeek = Number(payload.weekNum) || 1;
	const mondayItem =
		payload.weekDayList?.find((d) => d.weekDay === '1' || d.weekDay === '一') ??
		payload.weekDayList?.[0];
	if (!mondayItem || !mondayItem.weekDate) {
		return '';
	}

	const [monthStr, dayStr] = mondayItem.weekDate.split('/');
	const month = Number(monthStr);
	const day = Number(dayStr);
	if (!month || !day) return '';

	let year = new Date().getFullYear();
	if (payload.yearTerm) {
		const match = payload.yearTerm.match(/(\d{4})-(\d{4})/);
		if (match) {
			const y1 = Number(match[1]);
			const y2 = Number(match[2]);
			year = month >= 8 ? y1 : y2;
		}
	}

	const mondayDate = new Date(Date.UTC(year, month - 1, day));
	const offsetDays = (currentWeek - 1) * 7;
	mondayDate.setUTCDate(mondayDate.getUTCDate() - offsetDays);

	const y = mondayDate.getUTCFullYear();
	const m = String(mondayDate.getUTCMonth() + 1).padStart(2, '0');
	const d = String(mondayDate.getUTCDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/** Normalize CQUT online or legacy preview JSON into a Chronos timetable. */
export function parseCqutScheduleData(
	rawData: CqutScheduleRawInput,
	studentId = '',
	fallbackCampusId: CqutCampusId = DEFAULT_CQUT_CAMPUS_ID,
	t: (key: string) => string = (key) => key
): Timetable {
	let courses: Course[] = [];
	let termStartDate = rawData.termStartDate ?? '';
	let timetableName = rawData.studentName
		? formatStudentTimetableName(rawData.studentName, t)
		: rawData.termName || t('timetable.defaultName');

	const payload = rawData.payload;
	if (payload?.eventList && Array.isArray(payload.eventList)) {
		timetableName = studentId
			? formatStudentTimetableName(studentId, t)
			: payload.yearTerm || t('timetable.defaultName');
		termStartDate = inferCqutTermStartDate(payload);

		courses = payload.eventList
			.map((event, idx) => {
				const dayOfWeek = Number(event.weekDay);
				const startPeriod = Number(event.sessionStart);
				if (!dayOfWeek || Number.isNaN(startPeriod) || !event.eventName?.trim()) {
					return null;
				}

				const duration = Number(event.sessionLast) || 1;
				const sessionMax = event.sessionList?.length
					? Math.max(...event.sessionList.map(Number).filter((n) => !Number.isNaN(n)))
					: Number.NEGATIVE_INFINITY;
				const endPeriod = Number.isFinite(sessionMax) ? sessionMax : startPeriod + duration - 1;

				const weeks = [
					...new Set((event.weekList || []).map((w) => Number(w)).filter((w) => !Number.isNaN(w)))
				].sort((a, b) => a - b);

				const eventName = event.eventName.trim();
				const normalizedName = normalizedCourseName(eventName);

				return createCourse({
					id: event.eventID?.trim() || `cqut-${dayOfWeek}-${startPeriod}-${endPeriod}-${idx}`,
					name: normalizedName,
					teacher: event.memberName?.trim() ?? '',
					location: event.address?.trim() ?? '',
					dayOfWeek,
					startPeriod,
					endPeriod: Math.max(startPeriod, endPeriod),
					weeks,
					remark: event.remark?.trim() ?? ''
				});
			})
			.filter((c): c is Course => c !== null);
	}

	const resolvedCampusId = (rawData.campusId as CqutCampusId) || fallbackCampusId;
	const campusPeriodTimes = rawData.campusPeriodTimes || CQUT_DEFAULT_CAMPUS_PERIOD_TIMES;
	const activePeriodTimes =
		campusPeriodTimes[resolvedCampusId] ?? CQUT_DEFAULT_CAMPUS_PERIOD_TIMES[DEFAULT_CQUT_CAMPUS_ID];

	const customMetadata: Record<string, unknown> = {
		'source-cqut': {
			campusId: resolvedCampusId,
			campusPeriodTimes,
			studentId
		} satisfies CqutCampusScheduleMetadata
	};

	const maxWeek = Math.max(20, ...courses.flatMap((c) => c.weeks));

	const academicConfig: AcademicConfig = {
		termStartDate,
		startWeek: 1,
		endWeek: maxWeek,
		periodTimes: activePeriodTimes
	};

	return createTimetable({
		id: `cqut_${studentId || Date.now()}`,
		name: timetableName,
		courses,
		academicConfig,
		viewPrefs: {
			...deriveWeekendViewPrefs(courses),
			showNonCurrentWeekCourses: false
		},
		importMetadata: {
			source: 'cqut-online',
			campusId: resolvedCampusId
		},
		customMetadata
	});
}
