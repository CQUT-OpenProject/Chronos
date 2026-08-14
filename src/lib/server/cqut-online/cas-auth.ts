import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import {
	CAS_APPLICATION_CODE,
	JSON_MEDIA_TYPE,
	TIMETABLE_HOST,
	TIMETABLE_SESSION_COOKIE,
	UNIVERSITY_ID,
	UIS_BASE_URL,
	TIMETABLE_BASE_URL
} from './config';
import type { CookieJar } from './cookie-jar';
import { requestStep } from './http-client';

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

function stringValue(value: unknown): string | null {
	return typeof value === 'string' ? value : null;
}

function looksLikeCaptchaRequired(
	jsonObject: Record<string, unknown>,
	message: string | null
): boolean {
	if (message?.includes('验证码')) return true;
	return (
		'verifyCode' in jsonObject && jsonObject.verifyCode != null && jsonObject.verifyCode !== ''
	);
}

export interface CasLoginOverrides {
	uisBaseUrl: string;
	timetableBaseUrl: string;
	timetableHost: string;
}

function resolveEndpoints(overrides?: CasLoginOverrides) {
	const timetableBaseUrl = overrides?.timetableBaseUrl ?? TIMETABLE_BASE_URL;
	const uisBaseUrl = overrides?.uisBaseUrl ?? UIS_BASE_URL;
	return {
		casLoginUrl: `${uisBaseUrl}/center-auth-server/sso/doLogin`,
		casTicketUrl: `${uisBaseUrl}/center-auth-server/${CAS_APPLICATION_CODE}/cas/login`,
		casServiceUrl: `${timetableBaseUrl}/api/auth/casLogin`,
		timetableHost: overrides?.timetableHost ?? TIMETABLE_HOST
	};
}

export async function loginCas(
	jar: CookieJar,
	account: string,
	encryptedPassword: string,
	signal?: AbortSignal,
	overrides?: CasLoginOverrides
): Promise<AppResult<void>> {
	const endpoints = resolveEndpoints(overrides);
	const loginBody = buildJsonObject({
		name: account,
		pwd: encryptedPassword,
		verifyCode: null,
		universityId: UNIVERSITY_ID,
		loginType: 'login'
	});

	const loginResponseResult = await requestStep(
		jar,
		endpoints.casLoginUrl,
		{
			method: 'POST',
			headers: { 'Content-Type': JSON_MEDIA_TYPE },
			body: loginBody
		},
		{ signal },
		'统一身份认证登录'
	);
	if (!loginResponseResult.ok) return loginResponseResult;

	const loginJson = parsePayloadObject(await loginResponseResult.value.text());
	if (!loginJson.ok) return loginJson;

	const upstreamCode = Number(loginJson.value.code);
	const message = stringValue(loginJson.value.msg);
	if (looksLikeCaptchaRequired(loginJson.value, message)) {
		return failure(AppError.auth('需要验证码，当前版本暂不支持'));
	}
	if (Number.isNaN(upstreamCode) || upstreamCode !== 200) {
		return failure(AppError.auth(message?.trim() || '统一身份认证登录失败'));
	}

	const casTicketUrl = `${endpoints.casTicketUrl}?service=${encodeURIComponent(endpoints.casServiceUrl)}`;
	const ticketResponseResult = await requestStep(
		jar,
		casTicketUrl,
		{ method: 'GET' },
		{
			redirect: 'manual',
			retryOnServerError: true,
			signal,
			acceptStatus: (status) => status >= 300 && status < 400
		},
		'获取课表系统登录票据'
	);
	if (!ticketResponseResult.ok) return ticketResponseResult;

	const location = ticketResponseResult.value.headers.get('location');
	if (!location) {
		return failure(AppError.auth('登录失败，请重新输入账号或密码'));
	}

	let ticket: string | null;
	try {
		ticket = new URL(location, casTicketUrl).searchParams.get('ticket');
	} catch {
		return failure(AppError.auth('登录失败，请重新输入账号或密码'));
	}
	if (!ticket?.startsWith('ST-')) {
		return failure(AppError.auth('登录失败，请重新输入账号或密码'));
	}

	const casLoginUrl = `${endpoints.casServiceUrl}?ticket=${encodeURIComponent(ticket)}`;
	const sessionResponseResult = await requestStep(
		jar,
		casLoginUrl,
		{ method: 'GET' },
		{ redirect: 'manual', signal, acceptStatus: (status) => status < 500 },
		'建立课表系统会话'
	);
	if (!sessionResponseResult.ok) return sessionResponseResult;

	if (!jar.hasCookie(endpoints.timetableHost, TIMETABLE_SESSION_COOKIE)) {
		return failure(AppError.auth('登录失败，请重新输入账号或密码'));
	}

	return success(undefined);
}
