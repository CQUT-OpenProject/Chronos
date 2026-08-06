import type { AuthSnapshot } from '$lib/models/auth';
import type { OnlineSchedulePayload } from '$lib/models/online-schedule';
import type { RemoteTimetableSource } from '$lib/domain/interfaces/remote-timetable-source';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { encryptCasPassword } from './cqut-cas-password-encryptor';

interface PreviewApiResponse {
	ok: true;
	payload: OnlineSchedulePayload;
}

interface PreviewApiErrorResponse {
	ok: false;
	error: {
		kind: string;
		message: string;
	};
}

export class ApiRemoteTimetableSource implements RemoteTimetableSource {
	async fetchSchedule(
		authSnapshot: AuthSnapshot,
		weekNum?: string | null,
		yearTerm?: string | null
	): Promise<AppResult<OnlineSchedulePayload>> {
		const account = authSnapshot.account.trim();
		const password = authSnapshot.password;
		if (!account || !password.trim()) {
			return failure(AppError.validation('账号和密码不能为空'));
		}

		let encryptedPassword: string;
		try {
			encryptedPassword = encryptCasPassword(password);
		} catch {
			return failure(AppError.security('密码加密失败'));
		}

		let response: Response;
		try {
			response = await fetch('/api/cqut/preview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					account,
					encryptedPassword,
					weekNum: weekNum ?? null,
					yearTerm: yearTerm ?? null
				})
			});
		} catch {
			return failure(AppError.network('在线课表请求失败'));
		}

		let body: PreviewApiResponse | PreviewApiErrorResponse;
		try {
			body = (await response.json()) as PreviewApiResponse | PreviewApiErrorResponse;
		} catch {
			return failure(AppError.dataFormat('在线课表响应格式错误'));
		}

		if (!body.ok) {
			return failure(mapApiError(body.error));
		}

		return success(body.payload);
	}
}

function mapApiError(error: PreviewApiErrorResponse['error']) {
	switch (error.kind) {
		case 'Validation':
			return AppError.validation(error.message);
		case 'Auth':
			return AppError.auth(error.message);
		case 'Network':
			return AppError.network(error.message);
		case 'DataFormat':
			return AppError.dataFormat(error.message);
		case 'Security':
			return AppError.security(error.message);
		default:
			return AppError.unknown(error.message);
	}
}
