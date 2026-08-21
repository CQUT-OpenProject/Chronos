import { json } from '@sveltejs/kit';
import type { PluginServerHandler, PluginServerManifest } from '@chronos/core';
import { fetchCqutSchedule } from './fetch-schedule';

interface PreviewRequestBody {
	account?: string;
	username?: string;
	password?: string;
	encryptedPassword?: string;
	weekNum?: string | null;
	yearTerm?: string | null;
}

export const handlePreview: PluginServerHandler = async ({ request }) => {
	let body: PreviewRequestBody;
	try {
		body = (await request.json()) as PreviewRequestBody;
	} catch {
		return json(
			{ ok: false, error: { kind: 'DataFormat', message: '请求格式错误' } },
			{ status: 400 }
		);
	}

	const account = (body.account ?? body.username)?.trim() ?? '';
	const password = (body.password ?? body.encryptedPassword)?.trim() ?? '';
	if (!account || !password) {
		return json(
			{ ok: false, error: { kind: 'Validation', message: '账号和密码不能为空' } },
			{ status: 400 }
		);
	}

	const result = await fetchCqutSchedule({
		account,
		password,
		weekNum: body.weekNum,
		yearTerm: body.yearTerm
	});

	if (result.ok) {
		return json({ ok: true, payload: result.value });
	}

	return json(
		{ ok: false, error: { kind: result.error.kind, message: result.error.message } },
		{ status: 502 }
	);
};

export const serverManifest: PluginServerManifest = {
	handlers: {
		preview: { POST: handlePreview }
	},
	proxy: {
		domains: ['cqut.edu.cn'],
		action: 'preview'
	}
};

export { fetchCqutSchedule } from './fetch-schedule';
export type { FetchCqutScheduleInput, FetchCqutScheduleResult } from './fetch-schedule';
