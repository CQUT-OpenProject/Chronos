import type {
	ChronosPlugin,
	ChronosContext,
	Timetable,
	Course,
	PeriodTime,
	AcademicConfig
} from '@chronos/core';
import { createCourse, createTimetable } from '@chronos/core';

export interface CqutCampusScheduleMetadata {
	campusId?: string;
	campusPeriodTimes?: Record<string, PeriodTime[]>;
	studentId?: string;
}

export interface CqutRawScheduleItem {
	courseName: string;
	teacherName?: string;
	roomName?: string;
	dayOfWeek: number;
	startPeriod: number;
	endPeriod: number;
	weeks: number[];
	remark?: string;
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

export interface CqutScheduleRawInput {
	studentName?: string;
	termName?: string;
	termStartDate?: string;
	campusId?: string;
	courses?: CqutRawScheduleItem[];
	campusPeriodTimes?: Record<string, PeriodTime[]>;
	payload?: CqutOnlinePayloadData;
	eventList?: CqutOnlineEventItem[];
	yearTerm?: string;
	weekNum?: string;
	weekDayList?: Array<{ weekDay: string; weekDate: string; today?: boolean }>;
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

export function parseCqutScheduleData(rawData: CqutScheduleRawInput, studentId = ''): Timetable {
	let courses: Course[] = [];
	let termStartDate = rawData.termStartDate ?? '';
	let timetableName = rawData.studentName
		? `${rawData.studentName}的课表`
		: rawData.termName || '重庆理工大学课表';

	const onlinePayload = rawData.payload ?? (rawData.eventList ? rawData : undefined);

	if (onlinePayload?.eventList && Array.isArray(onlinePayload.eventList)) {
		timetableName = studentId ? `${studentId}的课表` : onlinePayload.yearTerm || '重庆理工大学课表';
		termStartDate = inferCqutTermStartDate(onlinePayload);

		courses = onlinePayload.eventList
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

				return createCourse({
					id: event.eventID?.trim() || `cqut-${dayOfWeek}-${startPeriod}-${endPeriod}-${idx}`,
					name: event.eventName.trim(),
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
	} else if (rawData.courses && Array.isArray(rawData.courses)) {
		courses = rawData.courses.map((item, idx) =>
			createCourse({
				id: `cqut-${item.dayOfWeek}-${item.startPeriod}-${item.endPeriod}-${idx}`,
				name: item.courseName,
				teacher: item.teacherName ?? '',
				location: item.roomName ?? '',
				dayOfWeek: item.dayOfWeek,
				startPeriod: item.startPeriod,
				endPeriod: item.endPeriod,
				weeks: item.weeks,
				remark: item.remark ?? ''
			})
		);
	}

	const customMetadata: Record<string, unknown> = {};
	if (rawData.campusId || rawData.campusPeriodTimes || studentId) {
		customMetadata['source-cqut'] = {
			campusId: rawData.campusId,
			campusPeriodTimes: rawData.campusPeriodTimes,
			studentId
		} satisfies CqutCampusScheduleMetadata;
	}

	const activePeriodTimes =
		rawData.campusId && rawData.campusPeriodTimes?.[rawData.campusId]
			? rawData.campusPeriodTimes[rawData.campusId]
			: [];

	const maxWeek = Math.max(20, ...courses.flatMap((c) => c.weeks));

	const academicConfig: AcademicConfig = {
		termStartDate,
		startWeek: 1,
		endWeek: maxWeek,
		periodTimes: activePeriodTimes ?? []
	};

	return createTimetable({
		id: `cqut_${studentId || Date.now()}`,
		name: timetableName,
		courses,
		academicConfig,
		customMetadata
	});
}

export const cqutPlugin: ChronosPlugin = {
	id: 'source-cqut',
	name: () => '重庆理工大学教务适配器',
	version: '1.0.0',
	description: () => '支持 CQUT 统一身份认证与在线自动同步课表',

	apply(ctx: ChronosContext) {
		ctx.registerSource({
			id: 'cqut-online',
			title: () => '重庆理工大学 (CQUT)',
			authType: 'password',
			async fetchSchedule({ username, password }: { username?: string; password?: string }) {
				if (!username || !password) {
					throw new Error('请输入学号与密码');
				}

				const response = await ctx.env.http.request(
					'https://authserver.cqut.edu.cn/authserver/login',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
						body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
						useSession: true,
						sessionId: `cqut-${username}`,
						bypassCors: true
					}
				);

				if (!response.ok) {
					let errorMsg = '教务认证失败，请检查学号与密码';
					try {
						const errJson = (await response.json()) as { error?: { message?: string } };
						if (errJson?.error?.message) {
							errorMsg = errJson.error.message;
						}
					} catch {
						// Keep default error message
					}
					throw new Error(errorMsg);
				}

				let parsedJson: CqutScheduleRawInput;
				try {
					parsedJson = (await response.json()) as CqutScheduleRawInput;
				} catch {
					parsedJson = {};
				}

				return parseCqutScheduleData(parsedJson, username);
			}
		});

		ctx.on(
			'import:after',
			async ({ sourceId, timetable }: { sourceId: string; timetable: Timetable }) => {
				if (sourceId === 'cqut-online') {
					ctx.actions.notify(`成功同步《${timetable.name}》，已自动匹配校区作息。`);
				}
			}
		);
	}
};
