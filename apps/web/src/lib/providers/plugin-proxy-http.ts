import type { HttpRequestOptions, HttpResponse, IHttpService } from '@chronos/core';
import { PLUGIN_PROXY_ENTRIES } from '$lib/server/plugin-registry.generated';

function hostMatchesDomain(hostname: string, domain: string): boolean {
	const lowerHost = hostname.toLowerCase();
	const lowerDomain = domain.toLowerCase();
	return lowerHost === lowerDomain || lowerHost.endsWith(`.${lowerDomain}`);
}

function findProxyEntry(url: string) {
	try {
		const parsed = new URL(url);
		for (const entry of PLUGIN_PROXY_ENTRIES) {
			if (entry.domains.some((domain) => hostMatchesDomain(parsed.hostname, domain))) {
				return entry;
			}
		}
	} catch {
		for (const entry of PLUGIN_PROXY_ENTRIES) {
			if (entry.domains.some((domain) => url.includes(domain))) {
				return entry;
			}
		}
	}
	return null;
}

function extractCredentials(body: HttpRequestOptions['body']): {
	account: string;
	password: string;
} {
	if (typeof body !== 'string') {
		return { account: '', password: '' };
	}
	const trimmed = body.trim();
	if (trimmed.startsWith('{')) {
		try {
			const json = JSON.parse(trimmed) as {
				username?: string;
				account?: string;
				password?: string;
			};
			return {
				account: (json.username || json.account || '').trim(),
				password: json.password ?? ''
			};
		} catch {
			return { account: '', password: '' };
		}
	}
	const searchParams = new URLSearchParams(body);
	return {
		account: searchParams.get('username') || searchParams.get('account') || '',
		password: searchParams.get('password') || ''
	};
}

/**
 * Routes plugin upstream proxy calls to the host catch-all API.
 */
export class PluginProxyHttpAdapter implements IHttpService {
	constructor(private readonly inner: IHttpService) {}

	async request(url: string, options?: HttpRequestOptions): Promise<HttpResponse> {
		if (options?.bypassCors && typeof window !== 'undefined') {
			const entry = findProxyEntry(url);
			if (entry) {
				const { account, password } = extractCredentials(options.body);
				const controller = options.timeoutMs ? new AbortController() : undefined;
				const timeoutId =
					options.timeoutMs && controller
						? setTimeout(() => controller.abort(), options.timeoutMs)
						: undefined;

				try {
					const proxyRes = await fetch(`/api/plugins/${entry.pluginId}/${entry.action}`, {
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
						const errorMsg = proxyData?.error?.message || 'Plugin upstream connection failed';
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
		}

		return this.inner.request(url, options);
	}

	async clearSession(sessionId: string): Promise<void> {
		return this.inner.clearSession?.(sessionId);
	}
}
