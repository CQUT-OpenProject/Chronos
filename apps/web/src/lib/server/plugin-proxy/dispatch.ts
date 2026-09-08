import { json } from '@sveltejs/kit';
import type { PluginHttpMethod, PluginServerManifest } from '@chronos/core';
import { pluginServerError } from '@chronos/core';
import { ACTIVE_SERVER_PLUGIN_IDS } from '$lib/boot/plugin-proxy-meta.generated';
import { loadServerManifest } from '$lib/server/plugin-server-loader.generated';
import { defaultPluginRateLimiter, type PluginRateLimiter } from './rate-limit';

export interface PluginDispatcherOptions {
	activePluginIds?: readonly string[];
	loadManifest?: (pluginId: string) => Promise<PluginServerManifest | null>;
	rateLimiter?: PluginRateLimiter;
}

export class PluginDispatcher {
	private readonly activePluginIds: readonly string[];
	private readonly loadManifest: (pluginId: string) => Promise<PluginServerManifest | null>;
	private readonly rateLimiter: PluginRateLimiter;
	private readonly manifestCache = new Map<string, PluginServerManifest>();

	constructor(options: PluginDispatcherOptions = {}) {
		this.activePluginIds = options.activePluginIds ?? ACTIVE_SERVER_PLUGIN_IDS;
		this.loadManifest = options.loadManifest ?? loadServerManifest;
		this.rateLimiter = options.rateLimiter ?? defaultPluginRateLimiter;
	}

	private async getManifest(pluginId: string): Promise<PluginServerManifest | null> {
		if (!this.activePluginIds.includes(pluginId as (typeof ACTIVE_SERVER_PLUGIN_IDS)[number])) {
			return null;
		}
		if (!this.manifestCache.has(pluginId)) {
			const manifest = await this.loadManifest(pluginId);
			if (!manifest) return null;
			this.manifestCache.set(pluginId, manifest);
		}
		return this.manifestCache.get(pluginId) ?? null;
	}

	async dispatch(event: PluginProxyRequestEvent, method: PluginHttpMethod): Promise<Response> {
		const pluginId = event.params.pluginId ?? '';
		const action = resolveAction(event.params);

		if (!pluginId || !action) {
			return json(pluginServerError('NotFound', 'Not found'), { status: 404 });
		}

		const manifest = await this.getManifest(pluginId);
		const handler = manifest?.handlers[action]?.[method];
		if (!handler) {
			return json(pluginServerError('NotFound', 'Not found'), { status: 404 });
		}

		const rateLimit = this.rateLimiter.check(pluginId, event.getClientAddress());
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

export const defaultPluginDispatcher = new PluginDispatcher();

export function dispatchPluginRequest(
	event: PluginProxyRequestEvent,
	method: PluginHttpMethod
): Promise<Response> {
	return defaultPluginDispatcher.dispatch(event, method);
}
