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

export function parseCqutScheduleData(
	rawData: {
		studentName?: string;
		termName?: string;
		termStartDate?: string;
		campusId?: string;
		courses?: CqutRawScheduleItem[];
		campusPeriodTimes?: Record<string, PeriodTime[]>;
	},
	studentId = ''
): Timetable {
	const courses: Course[] = (rawData.courses ?? []).map((item, idx) =>
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

	const academicConfig: AcademicConfig = {
		termStartDate: rawData.termStartDate ?? '',
		startWeek: 1,
		endWeek: 20,
		periodTimes: activePeriodTimes ?? []
	};

	return createTimetable({
		id: `cqut_${studentId || Date.now()}`,
		name: rawData.studentName
			? `${rawData.studentName}的课表`
			: rawData.termName || '重庆理工大学课表',
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

				ctx.actions.notify(
					ctx.i18n.t('cqut.connecting', { default: '正在连接 CQUT 统一身份认证...' }),
					'info'
				);

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
					throw new Error('教务认证失败，请检查学号与密码');
				}

				let parsedJson: {
					studentName?: string;
					termName?: string;
					termStartDate?: string;
					campusId?: string;
					courses?: CqutRawScheduleItem[];
					campusPeriodTimes?: Record<string, PeriodTime[]>;
				};
				try {
					parsedJson = (await response.json()) as typeof parsedJson;
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
