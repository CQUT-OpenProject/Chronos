import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import {
	createCasClient,
	isCasErrorOfKind,
	type Fetcher,
	type HttpRequest,
	type HttpResponse
} from '@cqut-openproject/cas-sdk';
import { fetch as undiciFetch, type RequestInit as UndiciRequestInit } from 'undici';
import {
	CAS_APPLICATION_CODE,
	TIMETABLE_BASE_URL,
	TIMETABLE_HOST,
	TIMETABLE_SESSION_COOKIE,
	UIS_BASE_URL
} from './config';
import type { CookieJar } from './cookie-jar';
import { getCqutDispatcher } from './dispatcher';
import { requestStep } from './http-client';
import { toUpstreamNetworkError } from './upstream-error';

export interface CasLoginOverrides {
	uisBaseUrl?: string;
	timetableBaseUrl?: string;
	timetableHost?: string;
	applicationCode?: string;
}

function createUndiciFetcher(): Fetcher {
	return async (req: HttpRequest): Promise<HttpResponse> => {
		const undiciInit: UndiciRequestInit = {
			method: req.method ?? 'GET',
			headers: req.headers,
			body: req.body,
			redirect: req.redirect ?? 'follow',
			signal: req.signal,
			dispatcher: getCqutDispatcher()
		};
		const res = await undiciFetch(req.url, undiciInit);

		const headers: Record<string, string | string[]> = {};
		res.headers.forEach((value, key) => {
			headers[key] = value;
		});
		const rawSetCookies = (
			res.headers as unknown as { getSetCookie?: () => string[] }
		).getSetCookie?.();
		if (rawSetCookies && rawSetCookies.length > 0) {
			headers['set-cookie'] = rawSetCookies;
		}

		return {
			status: res.status,
			statusText: res.statusText,
			headers,
			url: res.url,
			text: async () => res.text(),
			json: async <T = unknown>(): Promise<T> => (await res.json()) as T
		};
	};
}

function resolveEndpoints(overrides?: CasLoginOverrides) {
	const timetableBaseUrl = overrides?.timetableBaseUrl ?? TIMETABLE_BASE_URL;
	const uisBaseUrl = overrides?.uisBaseUrl ?? UIS_BASE_URL;
	return {
		uisBaseUrl,
		casApplicationCode: overrides?.applicationCode ?? CAS_APPLICATION_CODE,
		casServiceUrl: `${timetableBaseUrl}/api/auth/casLogin`,
		timetableHost: overrides?.timetableHost ?? TIMETABLE_HOST
	};
}

export async function loginCas(
	jar: CookieJar,
	account: string,
	password: string,
	signal?: AbortSignal,
	overrides?: CasLoginOverrides
): Promise<AppResult<void>> {
	const endpoints = resolveEndpoints(overrides);

	const client = createCasClient({
		uisBaseUrl: endpoints.uisBaseUrl,
		applicationCode: endpoints.casApplicationCode,
		cookieJar: jar,
		fetcher: createUndiciFetcher()
	});

	const loginResult = await client.safeLogin({
		account,
		password,
		serviceUrl: endpoints.casServiceUrl,
		applicationCode: endpoints.casApplicationCode,
		signal
	});

	if (!loginResult.ok) {
		const err = loginResult.error;
		if (isCasErrorOfKind(err, 'CAPTCHA_REQUIRED')) {
			return failure(AppError.auth('需要验证码，当前版本暂不支持'));
		}
		if (isCasErrorOfKind(err, 'AUTH_FAILED')) {
			return failure(AppError.auth(err.message || '统一身份认证登录失败'));
		}
		if (isCasErrorOfKind(err, 'PROTOCOL_ERROR')) {
			return failure(AppError.auth('登录失败，请重新输入账号或密码'));
		}
		return failure(toUpstreamNetworkError(err, '统一身份认证登录', signal));
	}

	const ticket = loginResult.data.ticket;
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
