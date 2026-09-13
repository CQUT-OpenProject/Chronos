export interface FrameSize {
	width: number;
	height: number;
}

export interface CropTransform {
	scale: number;
	offsetX: number;
	offsetY: number;
}

export interface ExportCropOptions {
	sourceMime?: string;
}

/** Minimum scale so the image fully covers the crop frame (like CSS `background-size: cover`). */
export function computeCoverScale(
	naturalWidth: number,
	naturalHeight: number,
	frameWidth: number,
	frameHeight: number
): number {
	if (naturalWidth <= 0 || naturalHeight <= 0 || frameWidth <= 0 || frameHeight <= 0) {
		return 1;
	}
	return Math.max(frameWidth / naturalWidth, frameHeight / naturalHeight);
}

export function imageDisplaySize(
	naturalWidth: number,
	naturalHeight: number,
	scale: number
): { width: number; height: number } {
	return {
		width: naturalWidth * scale,
		height: naturalHeight * scale
	};
}

/** Clamp pan offsets so the scaled image always covers the frame. */
export function clampTransform(
	transform: CropTransform,
	naturalWidth: number,
	naturalHeight: number,
	frameWidth: number,
	frameHeight: number
): CropTransform {
	const { width: displayWidth, height: displayHeight } = imageDisplaySize(
		naturalWidth,
		naturalHeight,
		transform.scale
	);
	const maxOffsetX = Math.max(0, (displayWidth - frameWidth) / 2);
	const maxOffsetY = Math.max(0, (displayHeight - frameHeight) / 2);
	return {
		scale: transform.scale,
		offsetX: clamp(transform.offsetX, -maxOffsetX, maxOffsetX),
		offsetY: clamp(transform.offsetY, -maxOffsetY, maxOffsetY)
	};
}

export function imageTopLeft(
	transform: CropTransform,
	naturalWidth: number,
	naturalHeight: number,
	frameWidth: number,
	frameHeight: number
): { left: number; top: number } {
	const { width: displayWidth, height: displayHeight } = imageDisplaySize(
		naturalWidth,
		naturalHeight,
		transform.scale
	);
	return {
		left: (frameWidth - displayWidth) / 2 + transform.offsetX,
		top: (frameHeight - displayHeight) / 2 + transform.offsetY
	};
}

export function sourceCropRect(
	transform: CropTransform,
	naturalWidth: number,
	naturalHeight: number,
	frameWidth: number,
	frameHeight: number
): { x: number; y: number; width: number; height: number } {
	const { left, top } = imageTopLeft(
		transform,
		naturalWidth,
		naturalHeight,
		frameWidth,
		frameHeight
	);
	const scale = transform.scale;
	return {
		x: clamp(-left / scale, 0, naturalWidth),
		y: clamp(-top / scale, 0, naturalHeight),
		width: Math.min(frameWidth / scale, naturalWidth),
		height: Math.min(frameHeight / scale, naturalHeight)
	};
}

/** Export at native source-pixel resolution for the cropped region (no downscale). */
export function cropOutputSize(crop: { width: number; height: number }): FrameSize {
	return {
		width: Math.max(1, Math.round(crop.width)),
		height: Math.max(1, Math.round(crop.height))
	};
}

export function resolveExportMimeType(sourceMime: string): { mimeType: string; quality?: number } {
	switch (sourceMime) {
		case 'image/png':
			return { mimeType: 'image/png' };
		case 'image/webp':
			return { mimeType: 'image/webp', quality: 1 };
		case 'image/jpeg':
		case 'image/jpg':
			return { mimeType: 'image/jpeg', quality: 1 };
		default:
			return { mimeType: 'image/png' };
	}
}

export function zoomAtPoint(
	transform: CropTransform,
	naturalWidth: number,
	naturalHeight: number,
	frameWidth: number,
	frameHeight: number,
	pointX: number,
	pointY: number,
	nextScale: number,
	minScale: number
): CropTransform {
	const clampedScale = Math.max(minScale, nextScale);
	const { left, top } = imageTopLeft(
		transform,
		naturalWidth,
		naturalHeight,
		frameWidth,
		frameHeight
	);
	const imageX = (pointX - left) / transform.scale;
	const imageY = (pointY - top) / transform.scale;
	const { width: nextDisplayWidth, height: nextDisplayHeight } = imageDisplaySize(
		naturalWidth,
		naturalHeight,
		clampedScale
	);
	const nextLeft = pointX - imageX * clampedScale;
	const nextTop = pointY - imageY * clampedScale;
	return clampTransform(
		{
			scale: clampedScale,
			offsetX: nextLeft - (frameWidth - nextDisplayWidth) / 2,
			offsetY: nextTop - (frameHeight - nextDisplayHeight) / 2
		},
		naturalWidth,
		naturalHeight,
		frameWidth,
		frameHeight
	);
}

export async function loadImageFromSource(source: Blob | File): Promise<HTMLImageElement> {
	const image = new Image();
	const objectUrl = URL.createObjectURL(source);
	try {
		image.src = objectUrl;
		await image.decode();
		return image;
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

export async function exportCroppedImage(
	image: HTMLImageElement,
	frame: FrameSize,
	transform: CropTransform,
	options: ExportCropOptions = {}
): Promise<Blob> {
	const naturalWidth = image.naturalWidth || image.width;
	const naturalHeight = image.naturalHeight || image.height;
	const crop = sourceCropRect(transform, naturalWidth, naturalHeight, frame.width, frame.height);
	const { width: outW, height: outH } = cropOutputSize(crop);
	const { mimeType, quality } = resolveExportMimeType(options.sourceMime ?? '');

	const canvas = document.createElement('canvas');
	canvas.width = outW;
	canvas.height = outH;
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get canvas context');
	}

	context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH);

	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error('Failed to export cropped image'));
					return;
				}
				resolve(blob);
			},
			mimeType,
			quality
		);
	});
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}
