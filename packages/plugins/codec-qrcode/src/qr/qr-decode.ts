/**
 * QR Code image decoder leveraging Canvas rasterization and standard Web BarcodeDetector API.
 */

import { qrCodecLabels } from '../messages';

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
	labelFor?: (key: DecodeLabelKey) => string
): Promise<string> {
	const labels = qrCodecLabels('zh-cn');
	const textFor = (key: DecodeLabelKey) => labelFor?.(key) ?? labels[key];

	if (typeof window === 'undefined') {
		throw new Error(textFor('decode.browserOnly'));
	}

	try {
		const text = await blob.text();
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
			img.onerror = () => reject(new Error(textFor('decode.unreadableImage')));
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

	throw new Error(textFor('decode.noQrFound'));
}
