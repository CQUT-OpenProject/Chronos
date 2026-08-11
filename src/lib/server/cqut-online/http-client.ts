import { HTTP_RETRY_DELAY_MS, REQUEST_TIMEOUT_MS } from './config';
import type { CookieJar } from './cookie-jar';

export interface HttpRequestOptions {
	redirect?: RequestRedirect;
	signal?: AbortSignal;
	retryOnServerError?: boolean;
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
