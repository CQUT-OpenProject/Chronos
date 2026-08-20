import type { AppError } from './app-error';

export type AppResult<T> = { ok: true; value: T } | { ok: false; error: AppError };

export function success<T>(value: T): AppResult<T> {
	return { ok: true, value };
}

export function failure(error: AppError): AppResult<never> {
	return { ok: false, error };
}

export function map<T, R>(result: AppResult<T>, transform: (value: T) => R): AppResult<R> {
	if (!result.ok) return result;
	return success(transform(result.value));
}

export async function flatMap<T, R>(
	result: AppResult<T>,
	transform: (value: T) => AppResult<R> | Promise<AppResult<R>>
): Promise<AppResult<R>> {
	if (!result.ok) return result;
	return transform(result.value);
}

export function flatMapSync<T, R>(
	result: AppResult<T>,
	transform: (value: T) => AppResult<R>
): AppResult<R> {
	if (!result.ok) return result;
	return transform(result.value);
}
