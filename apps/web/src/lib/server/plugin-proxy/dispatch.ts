import { json } from '@sveltejs/kit';
import type { PluginHttpMethod, PluginServerManifest } from '@chronos/core';
import { pluginServerError } from '@chronos/core';
import { ACTIVE_SERVER_PLUGIN_IDS } from '$lib/boot/plugin-proxy-meta.generated';
import { loadServerManifest } from '$lib/server/plugin-server-loader.generated';
import { checkPluginRateLimit } from './rate-limit';

const manifestCache = new Map<string, PluginServerManifest>();

/** Visible for tests only. */
export function resetDispatchManifestCacheForTests(): void {
	manifestCache.clear();
}

async function getManifest(pluginId: string): Promise<PluginServerManifest | null> {
	if (!ACTIVE_SERVER_PLUGIN_IDS.includes(pluginId as (typeof ACTIVE_SERVER_PLUGIN_IDS)[number])) {
		return null;
	}
	if (!manifestCache.has(pluginId)) {
		const manifest = await loadServerManifest(pluginId);
		if (!manifest) return null;
		manifestCache.set(pluginId, manifest);
	}
	return manifestCache.get(pluginId) ?? null;
}

export type PluginProxyParams = {
	pluginId?: string;
	action?: string;
};

export type PluginProxyRequestEvent = {
	params: PluginProxyParams;
	request: Request;
	getClientAddress: () => string;
};

function resolveAction(params: PluginProxyParams): string {
	const raw = params.action ?? '';
	return raw.replace(/\/$/, '');
}

export async function dispatchPluginRequest(
	event: PluginProxyRequestEvent,
	method: PluginHttpMethod
): Promise<Response> {
	const pluginId = event.params.pluginId ?? '';
	const action = resolveAction(event.params);

	if (!pluginId || !action) {
		return json(pluginServerError('NotFound', 'Not found'), { status: 404 });
	}

	const manifest = await getManifest(pluginId);
	const handler = manifest?.handlers[action]?.[method];
	if (!handler) {
		return json(pluginServerError('NotFound', 'Not found'), { status: 404 });
	}

	const rateLimit = checkPluginRateLimit(pluginId, event.getClientAddress());
	if (!rateLimit.allowed) {
		return json(pluginServerError('RateLimited', 'rate_limited'), {
			status: 429,
			headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) }
		});
	}

	return handler({
		request: event.request,
		params: { pluginId, action },
		getClientAddress: event.getClientAddress
	});
}
