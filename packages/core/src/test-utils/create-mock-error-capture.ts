import type { CapturedError, IErrorCaptureService } from '../types/services';

export interface MockErrorCapture extends IErrorCaptureService {
	emitCaptured(entry: CapturedError): void;
}

export function createMockErrorCapture(): MockErrorCapture {
	const listeners = new Set<(entry: CapturedError) => void>();

	return {
		onCaptured(listener) {
			listeners.add(listener);
			return {
				dispose: () => listeners.delete(listener)
			};
		},
		emitCaptured(entry) {
			for (const listener of listeners) {
				listener(entry);
			}
		}
	};
}
