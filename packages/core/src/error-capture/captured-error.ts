import type { CapturedError, ErrorCaptureSource } from '../types/services';

function createEntryId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `err-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createCapturedError(
	source: ErrorCaptureSource,
	details: {
		name?: string;
		message: string;
		stack?: string;
		ts?: number;
		id?: string;
	}
): CapturedError {
	return {
		id: details.id ?? createEntryId(),
		ts: details.ts ?? Date.now(),
		source,
		name: details.name,
		message: details.message,
		stack: details.stack
	};
}

function formatConsoleArg(value: unknown): string {
	if (value instanceof Error) {
		return value.message || value.name || 'Error';
	}
	if (typeof value === 'string') return value;
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

export function mapErrorEvent(
	event: ErrorEvent,
	windowRef: EventTarget = typeof window !== 'undefined' ? window : ({} as EventTarget)
): CapturedError | null {
	if (event.error == null && event.target !== windowRef) {
		return null;
	}

	const err = event.error;
	if (err instanceof Error) {
		return createCapturedError('error', {
			name: err.name,
			message: err.message || event.message || 'Error',
			stack: err.stack
		});
	}

	return createCapturedError('error', {
		message: event.message || String(err ?? 'Unknown error')
	});
}

export function mapUnhandledRejectionEvent(event: PromiseRejectionEvent): CapturedError {
	const reason = event.reason;
	if (reason instanceof Error) {
		return createCapturedError('unhandledrejection', {
			name: reason.name,
			message: reason.message || 'Unhandled rejection',
			stack: reason.stack
		});
	}

	return createCapturedError('unhandledrejection', {
		message: typeof reason === 'string' ? reason : String(reason)
	});
}

export function mapConsoleErrorArgs(args: readonly unknown[]): CapturedError {
	const firstError = args.find((arg): arg is Error => arg instanceof Error);
	const message = args.map(formatConsoleArg).join(' ');
	return createCapturedError('console', {
		name: firstError?.name,
		message: message || 'console.error',
		stack: firstError?.stack
	});
}
