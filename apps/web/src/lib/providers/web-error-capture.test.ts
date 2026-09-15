import { describe, it, expect, vi } from 'vite-plus/test';
import {
	installBrowserErrorCapture,
	WebErrorCaptureProvider,
	type ErrorCaptureEnv
} from './web-error-capture';

describe('WebErrorCaptureProvider', () => {
	it('installBrowserErrorCapture restores listeners and console.error', () => {
		const listeners = new Map<string, EventListener>();
		const addEventListener = vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
			listeners.set(type, listener as EventListener);
		}) as ErrorCaptureEnv['addEventListener'];
		const removeEventListener = vi.fn((type: string) => {
			listeners.delete(type);
		}) as ErrorCaptureEnv['removeEventListener'];
		const originalError = vi.fn();
		const consoleRef = { error: originalError };
		const onEntry = vi.fn();
		const windowRef = {} as EventTarget;

		const dispose = installBrowserErrorCapture({
			onEntry,
			env: {
				window: windowRef,
				addEventListener,
				removeEventListener,
				console: consoleRef
			}
		});

		expect(addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
		expect(addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

		const errorListener = listeners.get('error');
		errorListener?.({
			error: new Error('captured'),
			message: 'captured',
			target: windowRef
		} as ErrorEvent);

		consoleRef.error('from console');
		expect(originalError).toHaveBeenCalledWith('from console');
		expect(onEntry).toHaveBeenCalledTimes(2);

		dispose();
		expect(removeEventListener).toHaveBeenCalledTimes(2);
		expect(consoleRef.error).toBe(originalError);
	});

	it('replays buffered bootstrap errors to late subscribers', () => {
		const listeners = new Map<string, EventListener>();
		const addEventListener = vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
			listeners.set(type, listener as EventListener);
		}) as ErrorCaptureEnv['addEventListener'];
		const removeEventListener = vi.fn() as ErrorCaptureEnv['removeEventListener'];
		const windowRef = {} as EventTarget;

		const provider = new WebErrorCaptureProvider({
			window: windowRef,
			addEventListener,
			removeEventListener,
			console: { error: vi.fn() }
		});

		const errorListener = listeners.get('error');
		errorListener?.({
			error: new Error('boot failed'),
			message: 'boot failed',
			target: windowRef
		} as ErrorEvent);

		const onCaptured = vi.fn();
		provider.onCaptured(onCaptured);

		expect(onCaptured).toHaveBeenCalledTimes(1);
		expect(onCaptured.mock.calls[0]?.[0]?.message).toBe('boot failed');

		provider.dispose();
	});
});
