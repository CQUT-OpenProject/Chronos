export type AppError =
	| { kind: 'Validation'; message: string }
	| { kind: 'Auth'; message: string }
	| { kind: 'Network'; message: string }
	| { kind: 'DataFormat'; message: string }
	| { kind: 'Security'; message: string }
	| { kind: 'NotFound'; message: string }
	| { kind: 'Unknown'; message: string; cause?: unknown };

export const AppError = {
	validation(message: string): AppError {
		return { kind: 'Validation', message };
	},
	auth(message: string): AppError {
		return { kind: 'Auth', message };
	},
	network(message: string): AppError {
		return { kind: 'Network', message };
	},
	dataFormat(message: string): AppError {
		return { kind: 'DataFormat', message };
	},
	security(message: string): AppError {
		return { kind: 'Security', message };
	},
	notFound(message: string): AppError {
		return { kind: 'NotFound', message };
	},
	unknown(message: string, cause?: unknown): AppError {
		return { kind: 'Unknown', message, cause };
	}
};

export type AppResult<T> = { ok: true; value: T } | { ok: false; error: AppError };

export function success<T>(value: T): AppResult<T> {
	return { ok: true, value };
}

export function failure(error: AppError): AppResult<never> {
	return { ok: false, error };
}
