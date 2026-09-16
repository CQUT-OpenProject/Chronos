import type { OverlayHistoryPort } from '@chronos/ui-kit';
import { bindOverlayCloser } from './nav-coordinator';
import {
	closeOverlayHistory,
	dismissOverlayWithoutHistoryPop,
	handleOverlayPopstate,
	openOverlayHistory
} from './nav-coordinator';

const popHandlers = new Set<() => void>();
let popListenerRegistered = false;

function ensurePopListener(): void {
	if (popListenerRegistered || typeof window === 'undefined') return;
	popListenerRegistered = true;
	window.addEventListener('popstate', () => {
		handleOverlayPopstate();
		for (const handler of popHandlers) {
			handler();
		}
	});
}

function createOverlayHistoryPortImpl(): OverlayHistoryPort {
	return {
		pushOverlay(id: string) {
			openOverlayHistory(id);
		},
		closeOverlay(id: string) {
			closeOverlayHistory(id);
		},
		dismissWithoutPop(id: string) {
			dismissOverlayWithoutHistoryPop(id);
		},
		onPopOverlay(handler: () => void) {
			ensurePopListener();
			popHandlers.add(handler);
			return () => {
				popHandlers.delete(handler);
			};
		},
		bindCloser(id: string, close: () => void) {
			return bindOverlayCloser(id, close);
		}
	};
}

let sharedPort: OverlayHistoryPort | null = null;

export function getOverlayHistoryPort(): OverlayHistoryPort {
	sharedPort ??= createOverlayHistoryPortImpl();
	return sharedPort;
}

/** @deprecated Prefer {@link getOverlayHistoryPort}. */
export function createOverlayHistoryPort(): OverlayHistoryPort {
	return getOverlayHistoryPort();
}
