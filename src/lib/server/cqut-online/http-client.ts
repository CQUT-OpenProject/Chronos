import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { HTTP_RETRY_DELAY_MS, REQUEST_TIMEOUT_MS } from './config';
import type { CookieJar } from './cookie-jar';
import { toUpstreamNetworkError } from './upstream-error';

export interface HttpRequestOptions {
	redirect?: RequestRedirect;
	signal?: AbortSignal;
	retryOnServerError?: boolean;
	acceptStatus?: (status: number) => boolean;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function mergeSignals(signals: AbortSignal[]): AbortSignal {
	if (signals.length === 1) return signals[0]!;
	const controller = new AbortController();
	for (const signal of signals) {
		if (signal.aborted) {
			controller.abort(signal.reason);
			return controller.signal;
		}
		signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
	}
	return controller.signal;
}

export async function request(
	jar: CookieJar,
	url: string,
	init: RequestInit,
	options: HttpRequestOptions = {}
): Promise<Response> {
	const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
	const signal = options.signal ? mergeSignals([options.signal, timeoutSignal]) : timeoutSignal;

	const execute = async (): Promise<Response> => {
		const headers = new Headers(init.headers);
		const cookieHeader = jar.cookieHeader(url);
		if (cookieHeader) {
			headers.set('cookie', cookieHeader);
		}
		const response = await fetch(url, {
			...init,
			headers,
			redirect: options.redirect ?? 'follow',
			signal
		});
		jar.storeFrom(response, url);
		return response;
	};

	if (!options.retryOnServerError) {
		return execute();
	}

	try {
		const response = await execute();
		if (response.status < 500) return response;
	} catch (error) {
		if (signal.aborted) throw error;
	}

	await sleep(HTTP_RETRY_DELAY_MS);
	return execute();
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
