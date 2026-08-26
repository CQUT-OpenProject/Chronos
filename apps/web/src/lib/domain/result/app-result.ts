import type { AppError } from './app-error';

export type AppResult<T> = { ok: true; value: T } | { ok: false; error: AppError };

export function success<T>(value: T): AppResult<T> {
	return { ok: true, value };
}

export function failure(error: AppError): AppResult<never> {
	return { ok: false, error };
}
