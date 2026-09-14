import {
	mapConsoleErrorArgs,
	mapErrorEvent,
	mapUnhandledRejectionEvent,
	type CapturedError,
	type IErrorCaptureService
} from '@chronos/core';

export interface ErrorCaptureEnv {
	addEventListener: (
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	) => void;
	removeEventListener: (
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions
	) => void;
	console: Pick<Console, 'error'>;
	window: EventTarget;
}

export interface InstallBrowserErrorCaptureOptions {
	onEntry: (entry: CapturedError) => void;
	env?: Partial<ErrorCaptureEnv>;
}

function resolveCaptureEnv(env?: Partial<ErrorCaptureEnv>): ErrorCaptureEnv | null {
	const win =
		env?.window ??
		(typeof globalThis !== 'undefined' && 'addEventListener' in globalThis
			? (globalThis as Window & typeof globalThis)
			: undefined);

	if (env?.addEventListener && env.removeEventListener && env.console) {
		return {
			window: win ?? ({} as EventTarget),
			addEventListener: env.addEventListener,
			removeEventListener: env.removeEventListener,
			console: env.console
		};
	}

	if (!win?.addEventListener) return null;

	return {
		window: win,
		addEventListener: env?.addEventListener ?? win.addEventListener.bind(win),
		removeEventListener: env?.removeEventListener ?? win.removeEventListener.bind(win),
		console: env?.console ?? console
	};
}

export function installBrowserErrorCapture(options: InstallBrowserErrorCaptureOptions): () => void {
	const resolved = resolveCaptureEnv(options.env);
	if (!resolved) return () => {};

	const { onEntry } = options;
	const { addEventListener, removeEventListener, console: consoleRef, window } = resolved;
	let capturing = false;

	const safeCapture = (mapper: () => CapturedError | null) => {
		if (capturing) return;
		capturing = true;
		try {
			const entry = mapper();
			if (entry) onEntry(entry);
		} catch {
			// Avoid recursive logging when a subscriber fails.
		} finally {
			capturing = false;
		}
	};

	const onError = (event: Event) => {
		safeCapture(() => mapErrorEvent(event as ErrorEvent, window));
	};

	const onUnhandledRejection = (event: Event) => {
		safeCapture(() => mapUnhandledRejectionEvent(event as PromiseRejectionEvent));
	};

	const originalConsoleError = consoleRef.error;
	const wrappedConsoleError = (...args: unknown[]) => {
		originalConsoleError.apply(consoleRef, args);
		safeCapture(() => mapConsoleErrorArgs(args));
	};

	consoleRef.error = wrappedConsoleError;
	addEventListener('error', onError);
	addEventListener('unhandledrejection', onUnhandledRejection);

	return () => {
		removeEventListener('error', onError);
		removeEventListener('unhandledrejection', onUnhandledRejection);
		consoleRef.error = originalConsoleError;
	};
}

const ERROR_CAPTURE_REPLAY_BUFFER_MAX = 100;

function appendReplayBuffer(
	buffer: CapturedError[],
	entry: CapturedError,
	maxEntries: number
): CapturedError[] {
	const next = [...buffer, entry];
	if (next.length <= maxEntries) return next;
	return next.slice(next.length - maxEntries);
}

export class WebErrorCaptureProvider implements IErrorCaptureService {
	private readonly listeners = new Set<(entry: CapturedError) => void>();
	private readonly replayBuffer: CapturedError[] = [];
	private readonly disposeCapture: () => void;

	constructor(env?: Partial<ErrorCaptureEnv>) {
		this.disposeCapture = installBrowserErrorCapture({
			onEntry: (entry) => this.dispatch(entry),
			env
		});
	}

	private dispatch(entry: CapturedError): void {
		const buffered = appendReplayBuffer(this.replayBuffer, entry, ERROR_CAPTURE_REPLAY_BUFFER_MAX);
		this.replayBuffer.length = 0;
		this.replayBuffer.push(...buffered);

		for (const listener of this.listeners) {
			listener(entry);
		}
	}

	onCaptured(listener: (entry: CapturedError) => void) {
		for (const entry of this.replayBuffer) {
			listener(entry);
		}
		this.listeners.add(listener);
		return {
			dispose: () => this.listeners.delete(listener)
		};
	}

	dispose(): void {
		this.disposeCapture();
		this.listeners.clear();
		this.replayBuffer.length = 0;
	}
}
