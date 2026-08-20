import type { HttpRequestOptions, HttpResponse, IHttpService } from '@chronos/core';

declare const __ONLINE_IMPORT_ENABLED__: boolean | undefined;

const CQUT_HOST_SUFFIX = 'cqut.edu.cn';

function isCqutOnlineRequest(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.hostname.toLowerCase().includes(CQUT_HOST_SUFFIX);
	} catch {
		return url.includes(CQUT_HOST_SUFFIX);
	}
}

function extractCredentials(body: HttpRequestOptions['body']): {
	account: string;
	password: string;
} {
	if (typeof body !== 'string') {
		return { account: '', password: '' };
	}
	const searchParams = new URLSearchParams(body);
	return {
		account: searchParams.get('username') || searchParams.get('account') || '',
		password: searchParams.get('password') || ''
	};
}

/**
 * Routes CQUT online-import HTTP calls to the host preview API.
 * Generic fetch/SSRF logic stays in WebHttpProxyProvider.
 */
export class CqutOnlineHttpAdapter implements IHttpService {
	constructor(private readonly inner: IHttpService) {}

	async request(url: string, options?: HttpRequestOptions): Promise<HttpResponse> {
		const isOnlineSupported =
			typeof __ONLINE_IMPORT_ENABLED__ !== 'undefined' ? __ONLINE_IMPORT_ENABLED__ : true;

		if (options?.bypassCors && !isOnlineSupported) {
			throw new Error(
				'当前为纯静态部署模式，在线教务同步需要服务端代理支持，请使用离线 HTML 导入或分享链接'
			);
		}

		if (options?.bypassCors && isCqutOnlineRequest(url) && typeof window !== 'undefined') {
			const { account, password } = extractCredentials(options.body);
			const controller = options.timeoutMs ? new AbortController() : undefined;
			const timeoutId =
				options.timeoutMs && controller
					? setTimeout(() => controller.abort(), options.timeoutMs)
					: undefined;

			try {
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
			} finally {
				if (timeoutId) clearTimeout(timeoutId);
			}
		}

		return this.inner.request(url, options);
	}

	async clearSession(sessionId: string): Promise<void> {
		return this.inner.clearSession(sessionId);
	}
}
