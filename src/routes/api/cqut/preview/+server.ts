import { json, type RequestHandler } from '@sveltejs/kit';
import { fetchCqutSchedule } from '$lib/server/cqut-online/fetch-schedule';
import { checkPreviewRateLimit } from '$lib/server/cqut-online/preview-rate-limit';

interface PreviewRequestBody {
	account?: string;
	encryptedPassword?: string;
	weekNum?: string | null;
	yearTerm?: string | null;
}

/** Vercel Pro allows up to 60s; Hobby plans may still enforce a lower platform limit. */
export const config = {
	maxDuration: 60
};

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const rateLimit = checkPreviewRateLimit(getClientAddress());
	if (!rateLimit.allowed) {
		return json(
			{ ok: false, error: { kind: 'Validation', message: '请求过于频繁，请稍后再试' } },
			{
				status: 429,
				headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) }
			}
		);
	}

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
