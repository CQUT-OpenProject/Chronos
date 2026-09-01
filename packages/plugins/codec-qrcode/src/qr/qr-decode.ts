/**
 * QR Code image decoder leveraging Canvas rasterization and standard Web BarcodeDetector API.
 */

export const CHRONOS_QR_PNG_KEYWORD = 'chronos-qr';

function readU32BE(bytes: Uint8Array, offset: number): number {
	return (
		(bytes[offset]! << 24) |
		(bytes[offset + 1]! << 16) |
		(bytes[offset + 2]! << 8) |
		bytes[offset + 3]!
	);
}

function isPng(bytes: Uint8Array): boolean {
	return (
		bytes.length >= 8 &&
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47
	);
}

export function extractChronosQrFromPng(bytes: Uint8Array): string | null {
	if (!isPng(bytes)) return null;

	let offset = 8;
	while (offset + 12 <= bytes.length) {
		const length = readU32BE(bytes, offset);
		const type = String.fromCharCode(
			bytes[offset + 4]!,
			bytes[offset + 5]!,
			bytes[offset + 6]!,
			bytes[offset + 7]!
		);
		const dataStart = offset + 8;
		const dataEnd = dataStart + length;
		if (dataEnd > bytes.length) break;

		if (type === 'tEXt') {
			const data = bytes.subarray(dataStart, dataEnd);
			const nullIdx = data.indexOf(0);
			if (nullIdx > 0) {
				const keyword = new TextDecoder().decode(data.subarray(0, nullIdx));
				const text = new TextDecoder().decode(data.subarray(nullIdx + 1));
				if (keyword === CHRONOS_QR_PNG_KEYWORD && text.startsWith('chronos-qr:')) {
					return text;
				}
			}
		}

		offset = dataEnd + 4;
	}

	return null;
}

interface BarcodeResult {
	rawValue: string;
	format: string;
}

interface BarcodeDetectorInstance {
	detect(source: HTMLCanvasElement | ImageBitmapSource): Promise<BarcodeResult[]>;
}

declare global {
	interface Window {
		BarcodeDetector?: {
			new (options?: { formats: string[] }): BarcodeDetectorInstance;
			getSupportedFormats?(): Promise<string[]>;
		};
	}
}

type DecodeLabelKey = 'decode.browserOnly' | 'decode.unreadableImage' | 'decode.noQrFound';

export async function decodeQrFromBlob(
	blob: Blob,
	labelFor: (key: DecodeLabelKey) => string
): Promise<string> {
	if (typeof window === 'undefined') {
		throw new Error(labelFor('decode.browserOnly'));
	}

	const bytes = new Uint8Array(await blob.arrayBuffer());
	const fromPng = extractChronosQrFromPng(bytes);
	if (fromPng) return fromPng;

	try {
		const text = new TextDecoder().decode(bytes);
		const match = /chronos-qr:[A-Za-z0-9+/=:_-]+/.exec(text);
		if (match) return match[0];
	} catch {
		// continue to image rasterization
	}

	const url = URL.createObjectURL(blob);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	try {
		const img = new Image();
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error(labelFor('decode.unreadableImage')));
			img.src = url;
		});

		const width = img.naturalWidth || img.width || 512;
		const height = img.naturalHeight || img.height || 512;
		canvas.width = width;
		canvas.height = height;
		ctx?.drawImage(img, 0, 0, width, height);

		if (window.BarcodeDetector) {
			try {
				const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
				const barcodes = await detector.detect(canvas);
				if (barcodes.length > 0 && barcodes[0]?.rawValue) {
					return barcodes[0].rawValue;
				}
			} catch (e) {
				console.warn('[BarcodeDetector] detect failed on canvas:', e);
			}
		}
	} finally {
		URL.revokeObjectURL(url);
	}

	throw new Error(labelFor('decode.noQrFound'));
}
