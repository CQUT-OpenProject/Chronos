/**
 * QR Code image decoder leveraging Canvas rasterization and standard Web BarcodeDetector API.
 */

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

export async function decodeQrFromBlob(blob: Blob): Promise<string> {
	if (typeof window === 'undefined') {
		throw new Error('QR 解码仅支持在浏览器环境中运行');
	}

	// 1. If text or SVG, attempt direct inspection first
	try {
		const text = await blob.text();
		const match = /chronos-qr:[A-Za-z0-9+/=:_-]+/.exec(text);
		if (match) return match[0];
	} catch {
		// continue to image rasterization
	}

	// 2. Load into Image and draw onto Canvas (works universally across SVG, PNG, JPEG, WebP)
	const url = URL.createObjectURL(blob);
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	try {
		const img = new Image();
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error('无法读取图片内容'));
			img.src = url;
		});

		const width = img.naturalWidth || img.width || 512;
		const height = img.naturalHeight || img.height || 512;
		canvas.width = width;
		canvas.height = height;
		ctx?.drawImage(img, 0, 0, width, height);

		// 3. Detect via standard BarcodeDetector API on Canvas
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

	throw new Error('未能从该图片中识别出有效的二维码或当前浏览器不支持原生扫码识别');
}
