import { AppError, failure, success, type AppResult } from '@chronos/core';
import {
	createCasClient,
	isCasErrorOfKind,
	type Fetcher,
	type HttpRequest,
	type HttpResponse
} from '@cqut-openproject/cas-sdk';
import { fetch as undiciFetch } from 'undici';
import {
	CAS_APPLICATION_CODE,
	TIMETABLE_BASE_URL,
	TIMETABLE_HOST,
	TIMETABLE_SESSION_COOKIE,
	UIS_BASE_URL
} from './config';
import type { CookieJar } from './cookie-jar';
import { getCqutDispatcher } from './dispatcher';
import { requestStep, withNetworkRetry } from './http-client';
import { toUpstreamNetworkError } from './upstream-error';

export interface CasLoginOverrides {
	uisBaseUrl?: string;
	timetableBaseUrl?: string;
	timetableHost?: string;
	applicationCode?: string;
}

function createUndiciFetcher(): Fetcher {
	return async (req: HttpRequest): Promise<HttpResponse> =>
		withNetworkRetry(req.signal, () =>
			undiciFetch(req.url, {
				method: req.method ?? 'GET',
				headers: req.headers,
				body: req.body,
				redirect: 'manual',
				signal: req.signal,
				dispatcher: getCqutDispatcher()
			})
		) as unknown as Promise<HttpResponse>;
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
		cookieJarFactory: () => jar,
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

	const session = loginResult.data;
	if (session.kind !== 'ticket') {
		return failure(AppError.auth('登录失败，请重新输入账号或密码'));
	}
	// Do not call session.dispose() — jar is shared with downstream timetable requests.

	const ticket = session.ticket;
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
