/**
 * Pure TypeScript QR Code generator (ISO/IEC 18004).
 * Versions 1–40, error-correction level L, mask pattern 0.
 */

import { selectVersion } from './qr-payload-encoder';
import { buildQrMatrix, type QrMatrix } from './qr-matrix-layout';

export type { QrMatrix } from './qr-matrix-layout';

export function generateQrMatrix(text: string): QrMatrix {
	const version = selectVersion(new TextEncoder().encode(text).length);
	return buildQrMatrix(text, version);
}
