import { describe, it, expect } from 'vite-plus/test';
import {
	createCapturedError,
	mapConsoleErrorArgs,
	mapErrorEvent,
	mapUnhandledRejectionEvent
} from '../src/error-capture';

describe('error capture mappers', () => {
	it('createCapturedError assigns id and ts', () => {
		const entry = createCapturedError('error', {
			message: 'boom',
			id: 'e1',
			ts: 42
		});
		expect(entry).toEqual({
			id: 'e1',
			ts: 42,
			source: 'error',
			message: 'boom'
		});
	});

	it('maps script errors and skips resource load errors', () => {
		const scriptError = new Error('script failed');
		const scriptEvent = {
			error: scriptError,
			message: 'script failed',
			target: {} as EventTarget
		} as ErrorEvent;

		expect(mapErrorEvent(scriptEvent, {} as EventTarget)?.message).toBe('script failed');

		const resourceEvent = {
			error: null,
			message: 'img load failed',
			target: { tagName: 'IMG' } as unknown as EventTarget
		} as ErrorEvent;

		expect(mapErrorEvent(resourceEvent, {} as EventTarget)).toBeNull();
	});

	it('maps unhandled rejections and console.error args', () => {
		const rejection = mapUnhandledRejectionEvent({
			reason: new Error('rejected')
		} as PromiseRejectionEvent);
		expect(rejection.source).toBe('unhandledrejection');
		expect(rejection.message).toBe('rejected');

		const consoleEntry = mapConsoleErrorArgs(['failed', new Error('detail')]);
		expect(consoleEntry.source).toBe('console');
		expect(consoleEntry.message).toContain('failed');
		expect(consoleEntry.stack).toContain('Error');
	});
});
