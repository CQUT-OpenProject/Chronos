import type {
	ChronosPlugin,
	ChronosContext,
	Timetable,
	Course,
	PeriodTime,
	AcademicConfig,
	ConfigSchema
} from '@chronos/core';
import { type ChronosMountable } from '@chronos/core';
import {
	defineSchema,
	createCourse,
	createTimetable,
	coursePalette,
	deriveWeekendViewPrefs,
	normalizedCourseName,
	IHttpService
} from '@chronos/core';
import {
	CQUT_DEFAULT_CAMPUS_PERIOD_TIMES,
	DEFAULT_CQUT_CAMPUS_ID,
	type CqutCampusId
} from './campus-period-times';
import { htmlImportSchema, parseHtmlTimetable } from './html-parser';
import { createCqutImportSchema, SOURCE_CQUT_MESSAGES, type CqutImportForm } from './messages';

const SOURCE_CQUT_PLUGIN_ID = 'source-cqut';

export type { CqutCampusId } from './campus-period-times';
export {
	CQUT_CAMPUSES,
	CQUT_DEFAULT_CAMPUS_PERIOD_TIMES,
	DEFAULT_CQUT_CAMPUS_ID,
	getCampusApiName,
	getCampusDefaultPeriodTimes,
	campusIdToShareIndex,
	shareIndexToCampusId,
	resolveShareCampusId
} from './campus-period-times';

export type { CqutImportForm } from './messages';

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

/** 服务端 /api/plugins/source-cqut/preview 响应中插件可解析的字段（payload 形状单轨） */
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

export function parseCqutScheduleData(
	rawData: CqutScheduleRawInput,
	studentId = '',
	fallbackCampusId: CqutCampusId = DEFAULT_CQUT_CAMPUS_ID
): Timetable {
	let courses: Course[] = [];
	let termStartDate = rawData.termStartDate ?? '';
	let timetableName = rawData.studentName
		? `${rawData.studentName}的课表`
		: rawData.termName || '重庆理工大学课表';

	const payload = rawData.payload;
	if (payload?.eventList && Array.isArray(payload.eventList)) {
		timetableName = studentId ? `${studentId}的课表` : payload.yearTerm || '重庆理工大学课表';
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

import CqutOnlineImportTab from './CqutOnlineImportTab.svelte';
import EduHtmlImportTab from './EduHtmlImportTab.svelte';
import { mountableSvelteComponent } from '@chronos/ui-kit';

export interface CreateCqutPluginOptions {
	onlineComponent?: ChronosMountable;
	htmlComponent?: ChronosMountable;
}

export interface CqutPluginConfig {
	disabledSlots?: string[];
}

export function createCqutPlugin(
	options: CreateCqutPluginOptions = {}
): ChronosPlugin<CqutPluginConfig> {
	const {
		onlineComponent = mountableSvelteComponent(CqutOnlineImportTab),
		htmlComponent = mountableSvelteComponent(EduHtmlImportTab)
	} = options;
	let translate: ((key: string) => string) | undefined;

	return {
		id: 'source-cqut',
		name: () => translate?.('plugin.name') ?? SOURCE_CQUT_MESSAGES['zh-cn']['plugin.name'],
		version: '1.0.0',
		description: () =>
			translate?.('plugin.description') ?? SOURCE_CQUT_MESSAGES['zh-cn']['plugin.description'],
		category: 'source',
		order: 10,
		author: 'CQUT OpenProject',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',
		allowedDomains: ['authserver.cqut.edu.cn', 'uis.cqut.edu.cn', 'timetable-cfc.cqut.edu.cn'],

		apply(ctx: ChronosContext<CqutPluginConfig>) {
			ctx.i18n.registerMessages(SOURCE_CQUT_MESSAGES);
			const t = (key: string) => ctx.i18n.t(key);
			translate = t;
			const cqutImportSchema = createCqutImportSchema(t);
			const disabledSlots = new Set(ctx.config.disabledSlots ?? []);

			async function doImport(
				inputs: Record<string, unknown>,
				context?: ChronosContext
			): Promise<Timetable> {
				const activeCtx = context ?? ctx;
				const form = inputs as unknown as CqutImportForm;
				const username = (form.username || form.account)?.trim();
				const password = form.password;

				if (!username || !password?.trim()) {
					throw new Error(t('import.online.error.credentials'));
				}

				activeCtx.actions.notify(t('import.online.notify.connecting'), 'info');

				const http = activeCtx.service(IHttpService);
				if (!http.proxy) {
					throw new Error(t('import.online.error.proxyUnsupported'));
				}

				const response = await http.proxy(SOURCE_CQUT_PLUGIN_ID, 'preview', {
					account: username,
					password
				});

				if (!response.ok) {
					let errorMsg = t('import.online.error.authFailed');
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
				return parseCqutScheduleData(parsedJson, username, DEFAULT_CQUT_CAMPUS_ID);
			}

			async function doHtmlImport(inputs: Record<string, unknown>): Promise<Timetable> {
				const fileContent =
					(inputs.file as string | undefined) ?? (inputs.fileContent as string | undefined);
				if (!fileContent || typeof fileContent !== 'string') {
					throw new Error(t('import.html.error.invalidFile'));
				}
				const termStartDate = inputs.termStartDate as string | undefined;
				const campusId = (inputs.campusId as CqutCampusId | undefined) ?? DEFAULT_CQUT_CAMPUS_ID;
				return parseHtmlTimetable(fileContent, { termStartDate, campusId });
			}

			if (!disabledSlots.has('cqut-online')) {
				ctx.registerSlot('import.source.tab', {
					id: 'cqut-online',
					title: () => t('import.online.tab.title'),
					order: 10,
					importKind: 'online',
					supportingText: () => t('import.online.tab.supporting'),
					component: onlineComponent,
					inputSchema: cqutImportSchema as unknown as ConfigSchema<Record<string, unknown>>,
					executeImport: (inputs: Record<string, unknown>, context?: ChronosContext) =>
						doImport(inputs, context)
				});
			}

			if (!disabledSlots.has('edu-html')) {
				ctx.registerSlot('import.source.tab', {
					id: 'edu-html',
					title: () => t('import.html.tab.title'),
					order: 30,
					importKind: 'file',
					supportingText: () => t('import.html.tab.supporting'),
					component: htmlComponent,
					inputSchema: htmlImportSchema as unknown as ConfigSchema<Record<string, unknown>>,
					executeImport: (inputs: Record<string, unknown>) => doHtmlImport(inputs)
				});
			}
		}
	};
}

export const cqutPlugin = createCqutPlugin();

export { mergeWeekPayloads, resolveWeeksToFetch } from './week-merge';
export type {
	OnlineScheduleEvent,
	OnlineSchedulePayload,
	OnlineScheduleWeekDay
} from './week-merge';
export { htmlImportSchema, parseHtmlTimetable } from './html-parser';
export type { HtmlImportForm } from './html-parser';
