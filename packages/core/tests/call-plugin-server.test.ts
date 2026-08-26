import { describe, expect, it } from 'vite-plus/test';
import { callPluginServerJson } from '../src/plugin/call-plugin-server';
import type { HttpResponse, IHttpService } from '../src/types/services';

function mockHttpResponse(
	overrides: Pick<HttpResponse, 'status' | 'statusText' | 'ok'> & {
		jsonValue: unknown;
	}
): HttpResponse {
	return {
		status: overrides.status,
		statusText: overrides.statusText,
		headers: {},
		ok: overrides.ok,
		text: async () => JSON.stringify(overrides.jsonValue),
		json: async <T>() => overrides.jsonValue as T,
		bytes: async () => new Uint8Array()
	};
}

describe('callPluginServerJson', () => {
	it('accepts unwrapped payload when proxy adapter unwraps success body', async () => {
		const schedulePayload = {
			payload: { eventList: [{ eventName: '测试课程' }] },
			campusId: 'huaxi',
			campusPeriodTimes: { huaxi: [] }
		};
		const http: IHttpService = {
			request: async () =>
				mockHttpResponse({ status: 404, statusText: 'Not Found', ok: false, jsonValue: null }),
			proxy: async () =>
				mockHttpResponse({
					status: 200,
					statusText: 'OK',
					ok: true,
					jsonValue: schedulePayload
				})
		};

		const { response, body } = await callPluginServerJson(http, 'source-cqut', 'preview', {
			account: 'stu001',
			password: 'pass'
		});

		expect(response.ok).toBe(true);
		expect(body).toEqual({ ok: true, payload: schedulePayload });
	});

	it('parses wire error envelope when proxy reports failure', async () => {
		const wireError = {
			ok: false,
			error: { kind: 'Auth', message: '认证失败' }
		};
		const http: IHttpService = {
			request: async () =>
				mockHttpResponse({ status: 404, statusText: 'Not Found', ok: false, jsonValue: null }),
			proxy: async () =>
				mockHttpResponse({
					status: 502,
					statusText: '认证失败',
					ok: false,
					jsonValue: wireError
				})
		};

		const { response, body } = await callPluginServerJson(http, 'source-cqut', 'preview', {
			account: 'stu001',
			password: 'bad'
		});

		expect(response.ok).toBe(false);
		expect(body).toEqual(wireError);
	});
});
