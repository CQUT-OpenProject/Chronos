import type { HttpRequestOptions, HttpResponse } from '@chronos/core';

export class WebHttpAdapter {
	async request(url: string, options?: HttpRequestOptions): Promise<HttpResponse> {
		const controller = options?.timeoutMs ? new AbortController() : undefined;
		const timeoutId =
			options?.timeoutMs && controller
				? setTimeout(() => controller.abort(), options.timeoutMs)
				: undefined;

		try {
			// Host provider CORS bypass: route CQUT requests to local server proxy in browser environment
			if (options?.bypassCors && url.includes('cqut.edu.cn') && typeof window !== 'undefined') {
				let account = '';
				let password = '';
				if (typeof options.body === 'string') {
					const searchParams = new URLSearchParams(options.body);
					account = searchParams.get('username') || searchParams.get('account') || '';
					password = searchParams.get('password') || '';
				}

				const proxyRes = await fetch('/api/cqut/preview', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ account, password }),
					signal: controller?.signal
				});

				const proxyData = (await proxyRes.json()) as {
					ok?: boolean;
					payload?: unknown;
					error?: { message?: string };
				};

				if (!proxyRes.ok || !proxyData.ok) {
					const errorMsg = proxyData?.error?.message || 'CQUT upstream connection failed';
					return {
						status: proxyRes.status === 200 ? 502 : proxyRes.status,
						statusText: errorMsg,
						headers: {},
						ok: false,
						text: async () => JSON.stringify(proxyData),
						json: async <T>() => proxyData as T,
						bytes: async () => new Uint8Array()
					};
				}

				const payloadStr = JSON.stringify(proxyData.payload ?? {});
				return {
					status: 200,
					statusText: 'OK',
					headers: { 'Content-Type': 'application/json' },
					ok: true,
					text: async () => payloadStr,
					json: async <T>() => (proxyData.payload ?? {}) as T,
					bytes: async () => new TextEncoder().encode(payloadStr)
				};
			}

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
