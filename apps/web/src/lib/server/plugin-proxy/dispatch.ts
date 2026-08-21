import { json, type RequestEvent } from '@sveltejs/kit';
import type { PluginHttpMethod } from '@chronos/core';
import {
	ACTIVE_SERVER_PLUGIN_IDS,
	type PluginProxyEntry
} from '$lib/boot/plugin-proxy-meta.generated';
import { loadServerManifest } from '$lib/server/plugin-server-loader.generated';
import { checkPluginRateLimit } from './rate-limit';

const manifestCache = new Map<string, Awaited<ReturnType<typeof loadServerManifest>>>();

async function getManifest(pluginId: string) {
	if (!ACTIVE_SERVER_PLUGIN_IDS.includes(pluginId as (typeof ACTIVE_SERVER_PLUGIN_IDS)[number])) {
		return null;
	}
	if (!manifestCache.has(pluginId)) {
		manifestCache.set(pluginId, await loadServerManifest(pluginId));
	}
	return manifestCache.get(pluginId) ?? null;
}

function resolveAction(params: { action?: string }): string {
	const raw = params.action ?? '';
	return raw.replace(/\/$/, '');
}

export async function dispatchPluginRequest(
	event: RequestEvent,
	method: PluginHttpMethod
): Promise<Response> {
	const pluginId = event.params.pluginId ?? '';
	const action = resolveAction(event.params);

	if (!pluginId || !action) {
		return json({ ok: false, error: { kind: 'NotFound', message: 'Not found' } }, { status: 404 });
	}

	const manifest = await getManifest(pluginId);
	const handler = manifest?.handlers[action]?.[method];
	if (!handler) {
		return json({ ok: false, error: { kind: 'NotFound', message: 'Not found' } }, { status: 404 });
	}

	const rateLimit = checkPluginRateLimit(pluginId, event.getClientAddress());
	if (!rateLimit.allowed) {
		return json(
			{ ok: false, error: { kind: 'Validation', message: '请求过于频繁，请稍后再试' } },
			{
				status: 429,
				headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) }
			}
		);
	}

	return handler({
		request: event.request,
		params: { pluginId, action },
		getClientAddress: event.getClientAddress
	});
}

export type { PluginProxyEntry };
