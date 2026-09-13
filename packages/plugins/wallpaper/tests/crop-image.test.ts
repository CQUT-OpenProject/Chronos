import { describe, expect, it } from 'vite-plus/test';
import {
	clampTransform,
	computeCoverScale,
	cropOutputSize,
	imageTopLeft,
	resolveExportMimeType,
	sourceCropRect,
	zoomAtPoint
} from '../src/crop-image';

describe('crop-image', () => {
	it('computeCoverScale covers landscape, portrait, and square images', () => {
		expect(computeCoverScale(2000, 1000, 400, 800)).toBe(0.8);
		expect(computeCoverScale(1000, 2000, 400, 800)).toBe(0.4);
		expect(computeCoverScale(1000, 1000, 400, 800)).toBe(0.8);
	});

	it('clampTransform keeps offsets within cover bounds', () => {
		const naturalWidth = 2000;
		const naturalHeight = 1000;
		const frameWidth = 400;
		const frameHeight = 800;
		const scale = computeCoverScale(naturalWidth, naturalHeight, frameWidth, frameHeight);
		const clamped = clampTransform(
			{ scale, offsetX: 999, offsetY: -999 },
			naturalWidth,
			naturalHeight,
			frameWidth,
			frameHeight
		);

		const { left, top } = imageTopLeft(
			clamped,
			naturalWidth,
			naturalHeight,
			frameWidth,
			frameHeight
		);
		const displayWidth = naturalWidth * scale;
		const displayHeight = naturalHeight * scale;

		expect(left).toBeLessThanOrEqual(0);
		expect(top).toBeLessThanOrEqual(0);
		expect(left + displayWidth).toBeGreaterThanOrEqual(frameWidth);
		expect(top + displayHeight).toBeGreaterThanOrEqual(frameHeight);
	});

	it('sourceCropRect stays inside the natural image', () => {
		const naturalWidth = 1600;
		const naturalHeight = 900;
		const frameWidth = 360;
		const frameHeight = 640;
		const scale = computeCoverScale(naturalWidth, naturalHeight, frameWidth, frameHeight);
		const transform = clampTransform(
			{ scale, offsetX: 40, offsetY: -20 },
			naturalWidth,
			naturalHeight,
			frameWidth,
			frameHeight
		);
		const crop = sourceCropRect(transform, naturalWidth, naturalHeight, frameWidth, frameHeight);

		expect(crop.x).toBeGreaterThanOrEqual(0);
		expect(crop.y).toBeGreaterThanOrEqual(0);
		expect(crop.x + crop.width).toBeLessThanOrEqual(naturalWidth + 0.001);
		expect(crop.y + crop.height).toBeLessThanOrEqual(naturalHeight + 0.001);
	});

	it('cropOutputSize preserves native source crop pixels', () => {
		expect(cropOutputSize({ width: 558.4, height: 1024.5 })).toEqual({
			width: 558,
			height: 1025
		});
	});

	it('resolveExportMimeType keeps lossless formats and max JPEG quality', () => {
		expect(resolveExportMimeType('image/png')).toEqual({ mimeType: 'image/png' });
		expect(resolveExportMimeType('image/jpeg')).toEqual({
			mimeType: 'image/jpeg',
			quality: 1
		});
	});

	it('zoomAtPoint keeps the anchor pixel stable', () => {
		const naturalWidth = 1200;
		const naturalHeight = 800;
		const frameWidth = 300;
		const frameHeight = 500;
		const minScale = computeCoverScale(naturalWidth, naturalHeight, frameWidth, frameHeight);
		const start = { scale: minScale, offsetX: 0, offsetY: 0 };
		const pointX = 150;
		const pointY = 250;
		const next = zoomAtPoint(
			start,
			naturalWidth,
			naturalHeight,
			frameWidth,
			frameHeight,
			pointX,
			pointY,
			minScale * 1.5,
			minScale
		);

		const startLeft = imageTopLeft(
			start,
			naturalWidth,
			naturalHeight,
			frameWidth,
			frameHeight
		).left;
		const nextLeft = imageTopLeft(next, naturalWidth, naturalHeight, frameWidth, frameHeight).left;
		const startImageX = (pointX - startLeft) / start.scale;
		const nextImageX = (pointX - nextLeft) / next.scale;

		expect(next.scale).toBeGreaterThan(start.scale);
		expect(nextImageX).toBeCloseTo(startImageX, 5);
	});
});
