import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import type { OnlineSchedulePayload } from '$lib/models/online-schedule';
import { onlineSchedulePayloadSchema } from '$lib/models/online-schedule-schema';
import { mergeWeekPayloads, resolveWeeksToFetch } from '$lib/parsers/cqut-online/cqut-week-merge';
import { CookieJar } from './cookie-jar';

const CAS_LOGIN_URL = 'https://uis.cqut.edu.cn/center-auth-server/sso/doLogin';
const CAS_TICKET_URL =
	'https://uis.cqut.edu.cn/center-auth-server/YF8A4013/cas/login?service=https://timetable-cfc.cqut.edu.cn/api/auth/casLogin';
const WEEK_EVENTS_URL = 'https://timetable-cfc.cqut.edu.cn/api/courseSchedule/listWeekEvents';
const SESSION_COOKIE_HOSTS = ['uis.cqut.edu.cn', 'timetable-cfc.cqut.edu.cn'];
const JSON_MEDIA_TYPE = 'application/json; charset=utf-8';

export interface FetchCqutScheduleInput {
	account: string;
	encryptedPassword: string;
	weekNum?: string | null;
	yearTerm?: string | null;
}

export async function fetchCqutSchedule(
	input: FetchCqutScheduleInput
): Promise<AppResult<OnlineSchedulePayload>> {
	const jar = new CookieJar();
	const loginResult = await login(jar, input.account, input.encryptedPassword);
	if (!loginResult.ok) return loginResult;
	return fetchTimetable(jar, input);
}

async function fetchTimetable(
	jar: CookieJar,
	input: FetchCqutScheduleInput
): Promise<AppResult<OnlineSchedulePayload>> {
	const initialPayload = await fetchWeekEvents(
		jar,
		input.account,
		input.weekNum,
		input.yearTerm,
		input.encryptedPassword,
		true
	);
	if (!initialPayload.ok) return initialPayload;

	const weeksToFetch = resolveWeeksToFetch(initialPayload.value, input.weekNum);
	if (weeksToFetch.length <= 1) {
		return initialPayload;
	}

	const targetYearTerm = input.yearTerm?.trim() || initialPayload.value.yearTerm.trim() || null;
	const payloads: OnlineSchedulePayload[] = [initialPayload.value];

	for (const targetWeek of weeksToFetch) {
		const isInitialWeek =
			targetWeek === initialPayload.value.weekNum &&
			(targetYearTerm ?? '') === initialPayload.value.yearTerm;
		if (isInitialWeek) continue;

		const result = await fetchWeekEvents(
			jar,
			input.account,
			targetWeek,
			targetYearTerm,
			input.encryptedPassword,
			true
		);
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
	encryptedPassword: string,
	allowReloginRetry: boolean
): Promise<AppResult<OnlineSchedulePayload>> {
	const body = buildJsonObject({
		userID: account,
		weekNum: weekNum?.trim() || null,
		yearTerm: yearTerm?.trim() || null
	});

	const response = await request(jar, WEEK_EVENTS_URL, {
		method: 'POST',
		headers: { 'Content-Type': JSON_MEDIA_TYPE },
		body
	});
	if (!response.ok) {
		return failure(AppError.network(`在线课表请求失败：HTTP ${response.status}`));
	}

	const raw = await response.text();
	const jsonObject = parsePayloadObject(raw);
	if (!jsonObject.ok) return jsonObject;

	if (looksLikeAuthError(jsonObject.value)) {
		if (!allowReloginRetry) {
			return failure(AppError.auth(authErrorMessage(jsonObject.value)));
		}
		const loginResult = await login(jar, account, encryptedPassword);
		if (!loginResult.ok) return loginResult;
		return fetchWeekEvents(jar, account, weekNum, yearTerm, encryptedPassword, false);
	}

	try {
		return success(onlineSchedulePayloadSchema.parse(jsonObject.value));
	} catch {
		return failure(AppError.dataFormat('在线课表响应格式错误'));
	}
}

async function login(
	jar: CookieJar,
	account: string,
	encryptedPassword: string
): Promise<AppResult<void>> {
	const loginBody = buildJsonObject({
		name: account,
		pwd: encryptedPassword,
		verifyCode: null,
		universityId: '100005',
		loginType: 'login'
	});

	const loginResponse = await request(jar, CAS_LOGIN_URL, {
		method: 'POST',
		headers: { 'Content-Type': JSON_MEDIA_TYPE },
		body: loginBody
	});
	if (!loginResponse.ok) {
		return failure(AppError.network(`统一身份认证登录失败：HTTP ${loginResponse.status}`));
	}

	const loginJson = parsePayloadObject(await loginResponse.text());
	if (!loginJson.ok) return loginJson;

	const code = stringValue(loginJson.value.code);
	const message = stringValue(loginJson.value.msg);
	if (code !== '200') {
		return failure(AppError.auth(message?.trim() || '统一身份认证登录失败'));
	}

	const ticketResponse = await request(jar, CAS_TICKET_URL, { method: 'GET' });
	if (!ticketResponse.ok) {
		return failure(AppError.network(`课表系统登录失败：HTTP ${ticketResponse.status}`));
	}

	if (!jar.hasSessionCookies(SESSION_COOKIE_HOSTS)) {
		return failure(AppError.auth('登录失败，请重新输入账号或密码'));
	}

	return success(undefined);
}

async function request(jar: CookieJar, url: string, init: RequestInit): Promise<Response> {
	const headers = new Headers(init.headers);
	const cookieHeader = jar.cookieHeader(url);
	if (cookieHeader) {
		headers.set('cookie', cookieHeader);
	}
	const response = await fetch(url, { ...init, headers });
	jar.storeFrom(response, url);
	return response;
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
	const message = stringValue(jsonObject.msg);
	return message?.trim() || '登录失败，请重新输入密码';
}

function stringValue(value: unknown): string | null {
	return typeof value === 'string' ? value : null;
}
