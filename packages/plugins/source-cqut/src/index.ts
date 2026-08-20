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
	IHttpService,
	IVaultService
} from '@chronos/core';

export type CqutCampusId = 'huaxi' | 'liangjiang';

const CQUT_PASSWORD_SECRET_KEY = 'source-cqut:password';
const CQUT_USERNAME_STORAGE_KEY = 'source-cqut:username';

export interface CqutPluginConfig {
	campusId: CqutCampusId;
	autoSyncOnLaunch: boolean;
	customAuthUrl: string;
}

export interface CqutImportForm {
	username?: string;
	account?: string;
	password?: string;
	campusId: CqutCampusId;
	saveCredentials?: boolean;
}

export const CQUT_DEFAULT_CAMPUS_PERIOD_TIMES: Record<CqutCampusId, PeriodTime[]> = {
	huaxi: [
		{ index: 1, startTime: '08:20', endTime: '09:05' },
		{ index: 2, startTime: '09:15', endTime: '10:00' },
		{ index: 3, startTime: '10:20', endTime: '11:05' },
		{ index: 4, startTime: '11:15', endTime: '12:00' },
		{ index: 5, startTime: '14:00', endTime: '14:45' },
		{ index: 6, startTime: '14:55', endTime: '15:40' },
		{ index: 7, startTime: '16:00', endTime: '16:45' },
		{ index: 8, startTime: '16:55', endTime: '17:40' },
		{ index: 9, startTime: '19:00', endTime: '19:45' },
		{ index: 10, startTime: '19:50', endTime: '20:35' }
	],
	liangjiang: [
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
	]
};

export const cqutConfigSchema = defineSchema<CqutPluginConfig>({
	campusId: {
		type: 'select',
		title: () => '就读校区',
		default: 'huaxi',
		options: [
			{ label: () => '花溪校区', value: 'huaxi' },
			{ label: () => '两江校区', value: 'liangjiang' }
		]
	},
	autoSyncOnLaunch: {
		type: 'boolean',
		title: () => '启动时自动同步课表',
		default: false
	},
	customAuthUrl: {
		type: 'string',
		title: () => '统一身份认证地址',
		default: 'https://authserver.cqut.edu.cn/authserver/login'
	}
});

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
	campusId: {
		type: 'select',
		title: () => '所在校区',
		default: 'huaxi',
		options: [
			{ label: () => '花溪校区', value: 'huaxi' },
			{ label: () => '两江校区', value: 'liangjiang' }
		]
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
		customMetadata
	});
}

export const cqutPlugin: ChronosPlugin<CqutPluginConfig> = {
	id: 'source-cqut',
	name: () => '重庆理工大学教务',
	version: '1.0.0',
	description: () => '提供 CQUT 统一身份认证在线课表同步与多校区作息映射',
	category: 'source',
	order: 10,
	author: 'CQUT OpenProject',
	homepage: 'https://github.com/CQUT-OpenProject/Chronos',
	permissions: ['network', 'storage'],
	allowedDomains: ['authserver.cqut.edu.cn', 'uis.cqut.edu.cn', 'timetable-cfc.cqut.edu.cn'],
	configSchema: cqutConfigSchema,
	defaultConfig: {
		campusId: 'huaxi',
		autoSyncOnLaunch: false,
		customAuthUrl: 'https://authserver.cqut.edu.cn/authserver/login'
	},

	apply(ctx: ChronosContext<CqutPluginConfig>) {
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
			const campusId = form.campusId;

			if (!username || !password?.trim()) {
				throw new Error('请输入学号与密码');
			}

			activeCtx.actions.notify('正在连接知行理工...', 'info');

			const http = activeCtx.service(IHttpService);
			const configObj = activeCtx.config as unknown as CqutPluginConfig | undefined;
			const response = await http.request('/api/cqut/preview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username,
					password,
					campusId: campusId || configObj?.campusId || 'huaxi'
				}),
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
			const timetable = parseCqutScheduleData(
				parsedJson,
				username,
				campusId || configObj?.campusId || 'huaxi'
			);
			await saveCredentialsIfRequested(username, password, form.saveCredentials, activeCtx);
			return timetable;
		}

		// Register import source tab slot
		ctx.registerSlot('import.source.tab', {
			id: 'cqut-online',
			title: () => '知行理工',
			order: 10,
			inputSchema: cqutImportSchema as unknown as ConfigSchema<Record<string, unknown>>,
			defaultInput: {
				campusId: ctx.config.campusId || 'huaxi',
				saveCredentials: false
			},
			executeImport: (inputs: Record<string, unknown>, context?: ChronosContext) =>
				doImport(inputs, context)
		});
	}
};

export { mergeWeekPayloads, resolveWeeksToFetch } from './week-merge';
export type {
	OnlineScheduleEvent,
	OnlineSchedulePayload,
	OnlineScheduleWeekDay
} from './week-merge';
