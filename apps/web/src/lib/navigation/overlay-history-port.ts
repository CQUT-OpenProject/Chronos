import type { OverlayHistoryPort } from '@chronos/ui-kit';
import {
	closeOverlayHistory,
	dismissOverlayWithoutHistoryPop,
	handleOverlayPopstate,
	openOverlayHistory
} from './nav-coordinator';

export function createOverlayHistoryPort(): OverlayHistoryPort {
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
			const listener = () => {
				handleOverlayPopstate();
				handler();
			};
			window.addEventListener('popstate', listener);
			return () => window.removeEventListener('popstate', listener);
		}
	};
}
