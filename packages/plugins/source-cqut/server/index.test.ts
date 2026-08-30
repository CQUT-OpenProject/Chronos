import { describe, expect, it, vi } from 'vite-plus/test';
import { parsePluginServerResponse } from '@chronos/core';
import { handlePreview } from './index';

vi.mock('./fetch-schedule', () => ({
	fetchCqutSchedule: vi.fn()
}));

import { fetchCqutSchedule } from './fetch-schedule';

function createPreviewEvent(body: unknown) {
	return {
		request: new Request('http://localhost/preview', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: typeof body === 'string' ? body : JSON.stringify(body)
		}),
		params: { pluginId: 'source-cqut', action: 'preview' },
		getClientAddress: () => '127.0.0.1'
	};
}

describe('handlePreview', () => {
	it('returns DataFormat error for invalid JSON body', async () => {
		const response = await handlePreview(createPreviewEvent('not-json'));
		const body = parsePluginServerResponse(await response.json());

		expect(response.status).toBe(400);
		expect(response.headers.get('Content-Type')).toContain('application/json');
		expect(body).toEqual({ ok: false, error: { kind: 'DataFormat', message: '请求格式错误' } });
	});

	it('returns Validation error when credentials are missing', async () => {
		const response = await handlePreview(createPreviewEvent({ account: '', password: '' }));
		const body = parsePluginServerResponse(await response.json());

		expect(response.status).toBe(400);
		expect(body).toEqual({
			ok: false,
			error: { kind: 'Validation', message: '账号和密码不能为空' }
		});
	});

	it('returns success payload from fetchCqutSchedule', async () => {
		const payload = {
			payload: {
				yearTerm: '2025-1',
				weekNum: '1',
				nowMonth: '9',
				importSource: 'test',
				termStartDate: null,
				yearTermList: [],
				weekList: [],
				weekDayList: [],
				eventList: []
			},
			campusId: 'huaxi' as const,
			campusPeriodTimes: { huaxi: [], liangjiang: [] }
		};
		vi.mocked(fetchCqutSchedule).mockResolvedValue({ ok: true, value: payload });

		const response = await handlePreview(
			createPreviewEvent({ account: 'stu001', password: 'secret' })
		);
		const body = parsePluginServerResponse(await response.json());

		expect(response.status).toBe(200);
		expect(body).toEqual({ ok: true, payload });
	});
});
