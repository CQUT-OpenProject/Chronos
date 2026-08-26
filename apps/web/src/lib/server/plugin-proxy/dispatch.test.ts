import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test';
import { pluginServerSuccess } from '@chronos/core';
import { PLUGIN_RATE_LIMIT_MAX } from './config';
import { dispatchPluginRequest, resetDispatchManifestCacheForTests } from './dispatch';
import { resetPluginRateLimitForTests } from './rate-limit';

vi.mock('$lib/server/plugin-server-loader.generated', () => ({
	loadServerManifest: vi.fn()
}));

vi.mock('$lib/boot/plugin-proxy-meta.generated', () => ({
	ACTIVE_SERVER_PLUGIN_IDS: ['source-cqut']
}));

import { loadServerManifest } from '$lib/server/plugin-server-loader.generated';

function createEvent(
	overrides: {
		pluginId?: string;
		action?: string;
		ip?: string;
	} = {}
) {
	return {
		params: {
			pluginId: overrides.pluginId ?? 'source-cqut',
			action: overrides.action ?? 'preview'
		},
		request: new Request('http://localhost/api/plugins/source-cqut/preview', {
			method: 'POST',
			body: JSON.stringify({ account: 'a', password: 'b' })
		}),
		getClientAddress: () => overrides.ip ?? '127.0.0.1'
	} as Parameters<typeof dispatchPluginRequest>[0];
}

describe('dispatchPluginRequest', () => {
	beforeEach(() => {
		resetPluginRateLimitForTests();
		resetDispatchManifestCacheForTests();
		vi.mocked(loadServerManifest).mockReset();
	});

	afterEach(() => {
		resetPluginRateLimitForTests();
		resetDispatchManifestCacheForTests();
	});

	it('returns NotFound for unknown plugin', async () => {
		const response = await dispatchPluginRequest(
			createEvent({ pluginId: 'unknown-plugin' }),
			'POST'
		);
		const body = await response.json();
		expect(response.status).toBe(404);
		expect(body).toEqual({ ok: false, error: { kind: 'NotFound', message: 'Not found' } });
	});

	it('returns NotFound for missing action handler', async () => {
		vi.mocked(loadServerManifest).mockResolvedValue({
			handlers: { preview: {} }
		});

		const response = await dispatchPluginRequest(createEvent({ action: 'missing' }), 'POST');
		const body = await response.json();
		expect(response.status).toBe(404);
		expect(body.ok).toBe(false);
	});

	it('returns Validation when rate limited', async () => {
		vi.mocked(loadServerManifest).mockResolvedValue({
			handlers: {
				preview: {
					POST: async () =>
						new Response(JSON.stringify(pluginServerSuccess({ ok: true })), { status: 200 })
				}
			}
		});

		for (let i = 0; i < PLUGIN_RATE_LIMIT_MAX; i++) {
			await dispatchPluginRequest(createEvent(), 'POST');
		}

		const response = await dispatchPluginRequest(createEvent(), 'POST');
		const body = await response.json();
		expect(response.status).toBe(429);
		expect(body).toEqual({
			ok: false,
			error: { kind: 'RateLimited', message: 'rate_limited' }
		});
	});

	it('delegates to handler and returns success body', async () => {
		const handler = vi.fn(async () => Response.json(pluginServerSuccess({ studentName: 'Alice' })));
		vi.mocked(loadServerManifest).mockResolvedValue({
			handlers: { preview: { POST: handler } }
		});

		const response = await dispatchPluginRequest(createEvent(), 'POST');
		const body = await response.json();

		expect(handler).toHaveBeenCalled();
		expect(body).toEqual({ ok: true, payload: { studentName: 'Alice' } });
	});
});
