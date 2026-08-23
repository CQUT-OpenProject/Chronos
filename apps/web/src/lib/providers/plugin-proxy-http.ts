import type { HttpResponse, IHttpService } from '@chronos/core';
import {
	parsePluginServerResponse,
	pluginServerErrorMessage,
	type PluginServerResponse
} from '@chronos/core';

function buildProxyResponse(
	proxyRes: Response,
	proxyData: PluginServerResponse<unknown>
): HttpResponse {
	if (!proxyRes.ok || !proxyData.ok) {
		const errorMsg = pluginServerErrorMessage(proxyData) ?? 'Plugin upstream connection failed';
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

/**
 * Adds explicit plugin upstream proxy routing to the host catch-all API.
 */
export class PluginProxyHttpAdapter implements IHttpService {
	constructor(private readonly inner: IHttpService) {}

	async request(url: string, options?: Parameters<IHttpService['request']>[1]) {
		return this.inner.request(url, options);
	}

	async proxy(
		pluginId: string,
		action: string,
		payload: unknown,
		options?: { timeoutMs?: number; signal?: AbortSignal }
	): Promise<HttpResponse> {
		if (typeof window === 'undefined') {
			throw new Error('Plugin proxy is only available in the browser');
		}

		const controller = options?.timeoutMs ? new AbortController() : undefined;
		const timeoutId =
			options?.timeoutMs && controller
				? setTimeout(() => controller.abort(), options.timeoutMs)
				: undefined;
		const signal = options?.signal ?? controller?.signal;

		try {
			const proxyRes = await fetch(`/api/plugins/${pluginId}/${action}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
				signal
			});

			const raw = await proxyRes.json();
			const proxyData = parsePluginServerResponse(raw);

			return buildProxyResponse(proxyRes, proxyData);
		} finally {
			if (timeoutId) clearTimeout(timeoutId);
		}
	}

	async clearSession(sessionId: string): Promise<void> {
		return this.inner.clearSession?.(sessionId);
	}
}
