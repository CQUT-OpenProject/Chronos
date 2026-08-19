import type { HttpRequestOptions, HttpResponse } from '@chronos/core';

export class WebHttpAdapter {
	async request(url: string, options?: HttpRequestOptions): Promise<HttpResponse> {
		const controller = options?.timeoutMs ? new AbortController() : undefined;
		const timeoutId =
			options?.timeoutMs && controller
				? setTimeout(() => controller.abort(), options.timeoutMs)
				: undefined;

		try {
			const headers = new Headers(options?.headers);

			let body: BodyInit | undefined;
			if (options?.body) {
				if (typeof options.body === 'string') {
					body = options.body;
				} else {
					body = options.body as unknown as Uint8Array<ArrayBuffer>;
				}
			}

			const response = await fetch(url, {
				method: options?.method ?? 'GET',
				headers,
				body,
				signal: controller?.signal
			});

			const responseHeaders: Record<string, string> = {};
			response.headers.forEach((val, key) => {
				responseHeaders[key] = val;
			});

			return {
				status: response.status,
				statusText: response.statusText,
				headers: responseHeaders,
				ok: response.ok,
				text: () => response.text(),
				json: <T = unknown>() => response.json() as Promise<T>,
				bytes: async () => {
					const buf = await response.arrayBuffer();
					return new Uint8Array(buf);
				}
			};
		} finally {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		}
	}

	async clearSession(_sessionId: string): Promise<void> {
		// Web host session cleanup if supported
	}
}
