import type { OverlayHistoryPort } from '@chronos/ui-kit';
import { openOverlayHistory } from './nav-coordinator';
const port: OverlayHistoryPort = { openOverlay: openOverlayHistory };
export function getOverlayHistoryPort(): OverlayHistoryPort {
	return port;
}
