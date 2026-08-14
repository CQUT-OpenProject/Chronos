import { AppError } from '$lib/domain/result/app-error';

function getCause(error: unknown): unknown {
	if (error && typeof error === 'object' && 'cause' in error) {
		return (error as { cause?: unknown }).cause;
	}
	return undefined;
}

function getErrorCode(error: unknown): string | undefined {
	if (error && typeof error === 'object' && 'code' in error) {
		const code = (error as { code?: unknown }).code;
		return typeof code === 'string' ? code : undefined;
	}
	return undefined;
}

function isDomAbortOrTimeout(error: unknown): boolean {
	if (error instanceof DOMException) {
		return error.name === 'AbortError' || error.name === 'TimeoutError';
	}
	return false;
}

function isTimeoutCode(code: string | undefined): boolean {
	return code === 'ETIMEDOUT' || code === 'UND_ERR_CONNECT_TIMEOUT';
}

function isTimeoutError(error: unknown): boolean {
	if (isDomAbortOrTimeout(error)) return true;

	if (isTimeoutCode(getErrorCode(error))) return true;

	const cause = getCause(error);
	if (cause && isTimeoutError(cause)) return true;

	if (error instanceof TypeError && error.message === 'fetch failed' && cause) {
		if (isDomAbortOrTimeout(cause)) return true;
		if (isTimeoutCode(getErrorCode(cause))) return true;
	}

	return false;
}

export function logUpstreamError(step: string, error: unknown): void {
	const cause = getCause(error);
	const parts = [`step=${step}`];

	for (const item of [error, cause]) {
		if (!item || typeof item !== 'object') continue;
		const record = item as Record<string, unknown>;
		if (typeof record.name === 'string') parts.push(`name=${record.name}`);
		if (typeof record.code === 'string') parts.push(`code=${record.code}`);
		if (typeof record.message === 'string') parts.push(`message=${record.message}`);
	}

	console.error('[cqut-online]', parts.join(' '));
}

export function toUpstreamNetworkError(
	error: unknown,
	step: string,
	parentSignal?: AbortSignal
): AppError {
	logUpstreamError(step, error);

	if (parentSignal?.aborted) {
		return AppError.network(`在线课表导入超时（${step}），请稍后重试`);
	}

	if (isTimeoutError(error)) {
		return AppError.network(`${step}超时，请稍后重试`);
	}

	return AppError.network(`${step}失败，请稍后重试`);
}
