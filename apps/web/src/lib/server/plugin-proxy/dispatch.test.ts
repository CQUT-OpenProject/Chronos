import { describe, expect, it, vi, beforeEach } from 'vite-plus/test';
import { pluginServerSuccess, type PluginServerManifest } from '@chronos/core';
import { PLUGIN_RATE_LIMIT_MAX } from './config';
import { PluginDispatcher, type PluginProxyRequestEvent } from './dispatch';
import { PluginRateLimiter } from './rate-limit';

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
	} satisfies PluginProxyRequestEvent;
}

describe('PluginDispatcher', () => {
	let dispatcher: PluginDispatcher;
	let rateLimiter: PluginRateLimiter;

	beforeEach(() => {
		vi.mocked(loadServerManifest).mockReset();
		rateLimiter = new PluginRateLimiter();
		dispatcher = new PluginDispatcher({ rateLimiter });
	});

	it('returns NotFound for unknown plugin', async () => {
		const response = await dispatcher.dispatch(createEvent({ pluginId: 'unknown-plugin' }), 'POST');
		const body = await response.json();
		expect(response.status).toBe(404);
		expect(body).toEqual({ ok: false, error: { kind: 'NotFound', message: 'Not found' } });
	});

	it('returns NotFound for missing action handler', async () => {
		vi.mocked(loadServerManifest).mockResolvedValue({
			handlers: { preview: {} }
		} satisfies PluginServerManifest);

		const response = await dispatcher.dispatch(createEvent({ action: 'missing' }), 'POST');
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
		} satisfies PluginServerManifest);

		for (let i = 0; i < PLUGIN_RATE_LIMIT_MAX; i++) {
			await dispatcher.dispatch(createEvent(), 'POST');
		}

		const response = await dispatcher.dispatch(createEvent(), 'POST');
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
		} satisfies PluginServerManifest);

		const response = await dispatcher.dispatch(createEvent(), 'POST');
		const body = await response.json();

		expect(handler).toHaveBeenCalled();
		expect(body).toEqual({ ok: true, payload: { studentName: 'Alice' } });
	});
});
