import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { fetch as undiciFetch, type RequestInit as UndiciRequestInit } from 'undici';
import { HTTP_RETRY_DELAY_MS, NETWORK_RETRY_COUNT, REQUEST_TIMEOUT_MS } from './config';
import type { CookieJar } from './cookie-jar';
import { getCqutDispatcher } from './dispatcher';
import { isTransientNetworkError, toUpstreamNetworkError } from './upstream-error';

export interface HttpRequestOptions {
	redirect?: RequestRedirect;
	signal?: AbortSignal;
	retryOnServerError?: boolean;
	acceptStatus?: (status: number) => boolean;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function request(
	jar: CookieJar,
	url: string,
	init: RequestInit,
	options: HttpRequestOptions = {}
): Promise<Response> {
	const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
	const signal = options.signal ? AbortSignal.any([options.signal, timeoutSignal]) : timeoutSignal;

	const executeOnce = async (): Promise<Response> => {
		const headers = new Headers(init.headers);
		const cookieHeader = jar.cookieHeader(url);
		if (cookieHeader) {
			headers.set('cookie', cookieHeader);
		}
		const requestInit: UndiciRequestInit = {
			...(init as UndiciRequestInit),
			headers,
			redirect: options.redirect ?? 'follow',
			signal,
			dispatcher: getCqutDispatcher()
		};
		const response = (await undiciFetch(url, requestInit)) as unknown as Response;
		jar.storeFrom(response, url);
		return response;
	};

	const executeWithNetworkRetry = async (): Promise<Response> => {
		let lastError: unknown;
		for (let attempt = 1; attempt <= NETWORK_RETRY_COUNT; attempt++) {
			try {
				return await executeOnce();
			} catch (error) {
				lastError = error;
				if (signal.aborted || attempt >= NETWORK_RETRY_COUNT || !isTransientNetworkError(error)) {
					throw error;
				}
				await sleep(HTTP_RETRY_DELAY_MS);
			}
		}
		throw lastError;
	};

	if (!options.retryOnServerError) {
		return executeWithNetworkRetry();
	}

	try {
		const response = await executeWithNetworkRetry();
		if (response.status < 500) return response;
	} catch (error) {
		if (signal.aborted) throw error;
	}

	await sleep(HTTP_RETRY_DELAY_MS);
	return executeWithNetworkRetry();
}

export async function requestStep(
	jar: CookieJar,
	url: string,
	init: RequestInit,
	options: HttpRequestOptions,
	step: string
): Promise<AppResult<Response>> {
	try {
		const response = await request(jar, url, init, options);
		const acceptable = options.acceptStatus?.(response.status) ?? response.ok;
		if (!acceptable) {
			return failure(AppError.network(`${step}失败：HTTP ${response.status}`));
		}
		return success(response);
	} catch (error) {
		return failure(toUpstreamNetworkError(error, step, options.signal));
	}
}
