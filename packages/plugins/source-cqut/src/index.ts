import type {
	ChronosPlugin,
	ChronosContext,
	Timetable,
	Course,
	PeriodTime,
	AcademicConfig,
	ConfigSchema
} from '@chronos/core';
import {
	defineSchema,
	createCourse,
	createTimetable,
	coursePalette,
	normalizedCourseName,
	IHttpService,
	IVaultService
} from '@chronos/core';
import { CQUT_DEFAULT_CAMPUS_PERIOD_TIMES, type CqutCampusId } from './campus-period-times';
import { htmlImportSchema, parseHtmlTimetable } from './html-parser';

export type { CqutCampusId } from './campus-period-times';
export {
	CQUT_CAMPUSES,
	CQUT_CAMPUS_IDS,
	DEFAULT_CQUT_CAMPUS_ID,
	CQUT_DEFAULT_CAMPUS_PERIOD_TIMES,
	getCampusApiName,
	getCampusDefaultPeriodTimes,
	isCqutCampusId,
	resolveCampusIdFromApiName,
	inferCampusIdFromCourses,
	campusIdToShareIndex,
	shareIndexToCampusId,
	resolveShareCampusId
} from './campus-period-times';

const CQUT_PASSWORD_SECRET_KEY = 'source-cqut:password';
const CQUT_USERNAME_STORAGE_KEY = 'source-cqut:username';

export interface CqutImportForm {
	username?: string;
	account?: string;
	password?: string;
	saveCredentials?: boolean;
}

export const cqutImportSchema = defineSchema<CqutImportForm>({
	username: {
		type: 'string',
		title: () => '学号 / 账号',
		placeholder: () => '请输入 CQUT 学号',
		required: true
	},
	password: {
		type: 'password',
		title: () => '统一认证密码',
		placeholder: () => '请输入统一身份认证密码',
		required: true
	},
	saveCredentials: {
		type: 'boolean',
		title: () => '在当前设备保存认证凭据',
		default: false
	}
});

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

export function parseCqutScheduleData(
	rawData: CqutScheduleRawInput,
	studentId = '',
	fallbackCampusId: CqutCampusId = 'huaxi'
): Timetable {
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

				const eventName = event.eventName.trim();
				const normalizedName = normalizedCourseName(eventName);
				const [color, textColor] = coursePalette(normalizedName);

				return createCourse({
					id: event.eventID?.trim() || `cqut-${dayOfWeek}-${startPeriod}-${endPeriod}-${idx}`,
					name: normalizedName,
					teacher: event.memberName?.trim() ?? '',
					location: event.address?.trim() ?? '',
					dayOfWeek,
					startPeriod,
					endPeriod: Math.max(startPeriod, endPeriod),
					color,
					textColor,
					weeks,
					remark: event.remark?.trim() ?? ''
				});
			})
			.filter((c): c is Course => c !== null);
	} else if (rawData.courses && Array.isArray(rawData.courses)) {
		courses = rawData.courses.map((item, idx) => {
			const normalizedName = normalizedCourseName(item.courseName);
			const [color, textColor] = coursePalette(normalizedName);
			return createCourse({
				id: `cqut-${item.dayOfWeek}-${item.startPeriod}-${item.endPeriod}-${idx}`,
				name: normalizedName,
				teacher: item.teacherName ?? '',
				location: item.roomName ?? '',
				dayOfWeek: item.dayOfWeek,
				startPeriod: item.startPeriod,
				endPeriod: item.endPeriod,
				color,
				textColor,
				weeks: item.weeks,
				remark: item.remark ?? ''
			});
		});
	}

	const resolvedCampusId = (rawData.campusId as CqutCampusId) || fallbackCampusId;
	const campusPeriodTimes = rawData.campusPeriodTimes || CQUT_DEFAULT_CAMPUS_PERIOD_TIMES;
	const activePeriodTimes =
		campusPeriodTimes[resolvedCampusId] ?? CQUT_DEFAULT_CAMPUS_PERIOD_TIMES.huaxi;

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
			showSaturday: courses.some((c) => c.dayOfWeek === 6),
			showSunday: courses.some((c) => c.dayOfWeek === 7),
			showNonCurrentWeekCourses: false
		},
		importMetadata: {
			source: 'ONLINE_EDU',
			campusId: resolvedCampusId
		},
		customMetadata
	});
}

export const cqutPlugin: ChronosPlugin = {
	id: 'source-cqut',
	name: () => 'CQUT-Timetable',
	version: '1.0.0',
	description: () => '从「知行理工」导入课表',
	category: 'source',
	order: 10,
	author: 'CQUT OpenProject',
	homepage: 'https://github.com/CQUT-OpenProject/Chronos',
	permissions: ['network', 'storage'],
	allowedDomains: ['authserver.cqut.edu.cn', 'uis.cqut.edu.cn', 'timetable-cfc.cqut.edu.cn'],

	apply(ctx: ChronosContext) {
		async function saveCredentialsIfRequested(
			username: string,
			password: string,
			saveCredentials: boolean | undefined,
			activeCtx: ChronosContext
		): Promise<void> {
			if (!saveCredentials) return;
			const vault = activeCtx.service(IVaultService);
			if (vault && (await vault.isSupported())) {
				await vault.storeSecret(CQUT_PASSWORD_SECRET_KEY, password);
			}
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(CQUT_USERNAME_STORAGE_KEY, username);
			}
		}

		async function doImport(
			inputs: Record<string, unknown>,
			context?: ChronosContext
		): Promise<Timetable> {
			const activeCtx = context ?? ctx;
			const form = inputs as unknown as CqutImportForm;
			const username = (form.username || form.account)?.trim();
			const password = form.password;

			if (!username || !password?.trim()) {
				throw new Error('请输入学号与密码');
			}

			activeCtx.actions.notify('正在连接知行理工...', 'info');

			const http = activeCtx.service(IHttpService);
			const response = await http.request('https://authserver.cqut.edu.cn/authserver/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
				useSession: true,
				sessionId: `cqut-${username}`,
				bypassCors: true
			});

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

			const parsedJson = (await response.json()) as CqutScheduleRawInput;
			const timetable = parseCqutScheduleData(parsedJson, username, 'huaxi');
			await saveCredentialsIfRequested(username, password, form.saveCredentials, activeCtx);
			return timetable;
		}

		async function doHtmlImport(inputs: Record<string, unknown>): Promise<Timetable> {
			const fileContent =
				(inputs.file as string | undefined) ?? (inputs.fileContent as string | undefined);
			if (!fileContent || typeof fileContent !== 'string') {
				throw new Error('请选择有效的 HTML 课表文件');
			}
			const termStartDate = inputs.termStartDate as string | undefined;
			const campusId = (inputs.campusId as CqutCampusId | undefined) ?? 'huaxi';
			return parseHtmlTimetable(fileContent, { termStartDate, campusId });
		}

		// Register import source tab slot
		ctx.registerSlot('import.source.tab', {
			id: 'cqut-online',
			title: () => '知行理工',
			order: 10,
			inputSchema: cqutImportSchema as unknown as ConfigSchema<Record<string, unknown>>,
			defaultInput: {
				saveCredentials: false
			},
			executeImport: (inputs: Record<string, unknown>, context?: ChronosContext) =>
				doImport(inputs, context)
		});

		ctx.registerSlot('import.source.tab', {
			id: 'edu-html',
			title: () => 'HTML 文件',
			order: 30,
			inputSchema: htmlImportSchema as unknown as ConfigSchema<Record<string, unknown>>,
			executeImport: (inputs: Record<string, unknown>) => doHtmlImport(inputs)
		});
	}
};

export { mergeWeekPayloads, resolveWeeksToFetch } from './week-merge';
export type {
	OnlineScheduleEvent,
	OnlineSchedulePayload,
	OnlineScheduleWeekDay
} from './week-merge';
export { htmlImportSchema, parseHtmlTimetable } from './html-parser';
export type { HtmlImportForm } from './html-parser';
