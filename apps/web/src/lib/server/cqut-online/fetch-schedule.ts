import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import type { CqutCampusId } from '$lib/models/cqut-campus';
import type { OnlineSchedulePayload } from '$lib/models/online-schedule';
import type { PeriodTime } from '$lib/models/timetable';
import { onlineSchedulePayloadSchema } from '$lib/models/online-schedule-schema';
import { mergeWeekPayloads, resolveWeeksToFetch } from '$lib/parsers/cqut-online/cqut-week-merge';
import { fetchCampusTimesForImport } from './fetch-campus-time';
import { loginCas } from './cas-auth';
import {
	JSON_MEDIA_TYPE,
	TOTAL_FETCH_TIMEOUT_MS,
	WEEK_EVENTS_URL,
	WEEK_FETCH_CONCURRENCY
} from './config';
import { mapWithConcurrency } from './concurrency';
import { CookieJar } from './cookie-jar';
import { requestStep } from './http-client';
import { toUpstreamNetworkError } from './upstream-error';

export interface FetchCqutScheduleInput {
	account: string;
	password?: string;
	encryptedPassword?: string;
	weekNum?: string | null;
	yearTerm?: string | null;
}

export interface FetchCqutScheduleResult {
	payload: OnlineSchedulePayload;
	campusId: CqutCampusId;
	campusPeriodTimes: Record<CqutCampusId, PeriodTime[]>;
}

export async function fetchCqutSchedule(
	input: FetchCqutScheduleInput
): Promise<AppResult<FetchCqutScheduleResult>> {
	const jar = new CookieJar();
	const signal = AbortSignal.timeout(TOTAL_FETCH_TIMEOUT_MS);
	const password = input.password ?? input.encryptedPassword ?? '';

	try {
		const loginResult = await loginCas(jar, input.account, password, signal);
		if (!loginResult.ok) return loginResult;

		const campusTimesResult = await fetchCampusTimesForImport(jar, signal);
		if (!campusTimesResult.ok) return campusTimesResult;

		const timetableResult = await fetchTimetable(jar, input.account, password, input, signal);
		if (!timetableResult.ok) return timetableResult;

		return success({
			payload: timetableResult.value,
			campusId: campusTimesResult.value.campusId,
			campusPeriodTimes: campusTimesResult.value.campusPeriodTimes
		});
	} catch (error) {
		return failure(toUpstreamNetworkError(error, '在线课表导入', signal));
	}
}

async function fetchTimetable(
	jar: CookieJar,
	account: string,
	password: string,
	input: FetchCqutScheduleInput,
	signal: AbortSignal
): Promise<AppResult<OnlineSchedulePayload>> {
	const initialPayload = await fetchWeekEvents(
		jar,
		account,
		input.weekNum,
		input.yearTerm,
		password,
		true,
		signal
	);
	if (!initialPayload.ok) return initialPayload;

	const weeksToFetch = resolveWeeksToFetch(initialPayload.value, input.weekNum);
	if (weeksToFetch.length <= 1) {
		return initialPayload;
	}

	const targetYearTerm = input.yearTerm?.trim() || initialPayload.value.yearTerm.trim() || null;
	const remainingWeeks = weeksToFetch.filter((targetWeek) => {
		const isInitialWeek =
			targetWeek === initialPayload.value.weekNum &&
			(targetYearTerm ?? '') === initialPayload.value.yearTerm;
		return !isInitialWeek;
	});

	const weekResults = await mapWithConcurrency(
		remainingWeeks,
		WEEK_FETCH_CONCURRENCY,
		async (targetWeek) =>
			fetchWeekEvents(jar, account, targetWeek, targetYearTerm, password, true, signal)
	);

	const payloads: OnlineSchedulePayload[] = [initialPayload.value];
	for (const result of weekResults) {
		if (!result.ok) return result;
		payloads.push(result.value);
	}

	return success(mergeWeekPayloads(initialPayload.value, payloads));
}

async function fetchWeekEvents(
	jar: CookieJar,
	account: string,
	weekNum: string | null | undefined,
	yearTerm: string | null | undefined,
	password: string,
	allowReloginRetry: boolean,
	signal: AbortSignal
): Promise<AppResult<OnlineSchedulePayload>> {
	const body = buildJsonObject({
		userID: account,
		weekNum: weekNum?.trim() || null,
		yearTerm: yearTerm?.trim() || null
	});

	const step = weekNum?.trim() ? `获取第 ${weekNum.trim()} 周课表` : '获取课表';
	const responseResult = await requestStep(
		jar,
		WEEK_EVENTS_URL,
		{
			method: 'POST',
			headers: { 'Content-Type': JSON_MEDIA_TYPE },
			body
		},
		{ signal },
		step
	);
	if (!responseResult.ok) return responseResult;

	const raw = await responseResult.value.text();
	const jsonObject = parsePayloadObject(raw);
	if (!jsonObject.ok) return jsonObject;

	if (looksLikeAuthError(jsonObject.value)) {
		if (!allowReloginRetry) {
			return failure(AppError.auth(authErrorMessage(jsonObject.value)));
		}
		const loginResult = await loginCas(jar, account, password, signal);
		if (!loginResult.ok) return loginResult;
		return fetchWeekEvents(jar, account, weekNum, yearTerm, password, false, signal);
	}

	try {
		return success(onlineSchedulePayloadSchema.parse(jsonObject.value));
	} catch {
		return failure(AppError.dataFormat('在线课表响应格式错误'));
	}
}

function buildJsonObject(entries: Record<string, string | null>): string {
	const objectValue: Record<string, string> = {};
	for (const [key, value] of Object.entries(entries)) {
		if (value !== null) objectValue[key] = value;
	}
	return JSON.stringify(objectValue);
}

function parsePayloadObject(raw: string): AppResult<Record<string, unknown>> {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			return failure(AppError.dataFormat('在线课表响应格式错误'));
		}
		return success(parsed as Record<string, unknown>);
	} catch {
		return failure(AppError.dataFormat('在线课表响应格式错误'));
	}
}

function looksLikeAuthError(jsonObject: Record<string, unknown>): boolean {
	if ('yearTerm' in jsonObject || 'weekDayList' in jsonObject) return false;
	return 'code' in jsonObject || 'msg' in jsonObject;
}

function authErrorMessage(jsonObject: Record<string, unknown>): string {
	const message = typeof jsonObject.msg === 'string' ? jsonObject.msg : null;
	return message?.trim() || '登录失败，请重新输入密码';
}
