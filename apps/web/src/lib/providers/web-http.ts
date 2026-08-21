import type { HttpRequestOptions, HttpResponse, IHttpService } from '@chronos/core';
import { profileHasServerPlugins } from '$lib/server/plugin-registry.generated';

/**
 * Checks whether a given hostname is a private or loopback IP address (anti-SSRF).
 */
function isPrivateOrLoopbackHost(hostname: string): boolean {
	const normalized = hostname.toLowerCase();
	if (
		normalized === 'localhost' ||
		normalized === '127.0.0.1' ||
		normalized === '0.0.0.0' ||
		normalized === '::1' ||
		normalized.endsWith('.local')
	) {
		return true;
	}

	// IPv4 private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
	const ipv4Match = normalized.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
	if (ipv4Match) {
		const [_, a, b] = ipv4Match.map(Number);
		if (a === 10) return true;
		if (a === 172 && b !== undefined && b >= 16 && b <= 31) return true;
		if (a === 192 && b === 168) return true;
		if (a === 169 && b === 254) return true;
		if (a === 127) return true;
	}

	return false;
}

/**
 * Checks if a hostname matches any pattern in the allowed domains whitelist.
 */
function isDomainAllowed(hostname: string, allowedDomains: string[]): boolean {
	if (allowedDomains.length === 0) return true;
	const lowerHost = hostname.toLowerCase();

	return allowedDomains.some((pattern) => {
		const lowerPattern = pattern.toLowerCase();
		if (lowerPattern.startsWith('*.')) {
			const suffix = lowerPattern.slice(1); // e.g. .cqut.edu.cn
			return lowerHost.endsWith(suffix) || lowerHost === lowerPattern.slice(2);
		}
		return lowerHost === lowerPattern;
	});
}

/**
 * WebHttpProxyProvider implements IHttpService for Web environments.
 * It manages direct fetches, CORS bypass proxy routing with whitelist validation,
 * anti-SSRF protections, and static deployment fallbacks.
 */
export class WebHttpProxyProvider implements IHttpService {
	private allowedDomains: string[];

	constructor(allowedDomains: string[] = []) {
		this.allowedDomains = allowedDomains;
	}

	async request(url: string, options?: HttpRequestOptions): Promise<HttpResponse> {
		const controller = options?.timeoutMs ? new AbortController() : undefined;
		const timeoutId =
			options?.timeoutMs && controller
				? setTimeout(() => controller.abort(), options.timeoutMs)
				: undefined;

		try {
			if (options?.bypassCors && !profileHasServerPlugins()) {
				throw new Error(
					'当前构建未启用服务端代理，在线教务同步不可用，请使用离线 HTML 导入或分享链接'
				);
			}

			// Validate URL and security constraints if bypassCors is requested
			if (options?.bypassCors) {
				try {
					const parsedUrl = new URL(url);
					if (isPrivateOrLoopbackHost(parsedUrl.hostname)) {
						throw new Error(
							`SSRF Protection: Requests to private host "${parsedUrl.hostname}" are forbidden.`
						);
					}
					if (!isDomainAllowed(parsedUrl.hostname, this.allowedDomains)) {
						throw new Error(
							`Domain "${parsedUrl.hostname}" is not in the allowed proxy whitelist.`
						);
					}
				} catch (err: unknown) {
					if (
						err instanceof Error &&
						(err.message.startsWith('SSRF') || err.message.startsWith('Domain'))
					) {
						throw err;
					}
					// If not a full URL, continue
				}
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
		// Session isolation cleanup hook if supported by server proxy
	}
}
