import { json, type RequestHandler } from '@sveltejs/kit';
import { fetchCqutSchedule } from '$lib/server/cqut-online/fetch-schedule';

interface PreviewRequestBody {
	account?: string;
	encryptedPassword?: string;
	weekNum?: string | null;
	yearTerm?: string | null;
}

export const POST: RequestHandler = async ({ request }) => {
	let body: PreviewRequestBody;
	try {
		body = (await request.json()) as PreviewRequestBody;
	} catch {
		return json(
			{ ok: false, error: { kind: 'DataFormat', message: '请求格式错误' } },
			{ status: 400 }
		);
	}

	const account = body.account?.trim() ?? '';
	const encryptedPassword = body.encryptedPassword?.trim() ?? '';
	if (!account || !encryptedPassword) {
		return json(
			{ ok: false, error: { kind: 'Validation', message: '账号和密码不能为空' } },
			{ status: 400 }
		);
	}

	const result = await fetchCqutSchedule({
		account,
		encryptedPassword,
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
