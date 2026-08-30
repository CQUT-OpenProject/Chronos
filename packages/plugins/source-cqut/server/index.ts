import type {
	PluginServerHandler,
	PluginServerManifest,
	PluginServerErrorKind
} from '@chronos/core';
import { pluginServerError, pluginServerSuccess } from '@chronos/core';
import { SERVER_PROXY_ACTION, SERVER_PROXY_DOMAINS } from './config';
import { fetchCqutSchedule } from './fetch-schedule';
import type { AppError } from './result/app-error';

function toWireErrorKind(kind: AppError['kind']): PluginServerErrorKind {
	switch (kind) {
		case 'Security':
		case 'Unknown':
			return 'Upstream';
		default:
			return kind;
	}
}

interface PreviewRequestBody {
	account?: string;
	username?: string;
	password?: string;
}

export const handlePreview: PluginServerHandler = async ({ request }) => {
	let body: PreviewRequestBody;
	try {
		body = (await request.json()) as PreviewRequestBody;
	} catch {
		return Response.json(pluginServerError('DataFormat', '请求格式错误'), { status: 400 });
	}

	const account = (body.account ?? body.username)?.trim() ?? '';
	const password = body.password?.trim() ?? '';
	if (!account || !password) {
		return Response.json(pluginServerError('Validation', '账号和密码不能为空'), { status: 400 });
	}

	const result = await fetchCqutSchedule({
		account,
		password
	});

	if (result.ok) {
		return Response.json(pluginServerSuccess(result.value));
	}

	return Response.json(
		pluginServerError(toWireErrorKind(result.error.kind), result.error.message),
		{
			status: 502
		}
	);
};

export const serverManifest: PluginServerManifest = {
	handlers: {
		preview: { POST: handlePreview }
	},
	proxy: {
		domains: [...SERVER_PROXY_DOMAINS],
		action: SERVER_PROXY_ACTION
	}
};
