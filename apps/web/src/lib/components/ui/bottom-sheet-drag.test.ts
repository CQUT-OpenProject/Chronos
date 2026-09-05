import { describe, expect, it } from 'vite-plus/test';
import {
	clampDragOffset,
	DISMISS_FALLBACK_THRESHOLD_PX,
	DISMISS_THRESHOLD_RATIO,
	needsSnapBackAnimation,
	overlayOpacityFromDrag,
	shouldDismissSheet
} from './bottom-sheet-drag';

describe('bottom-sheet-drag', () => {
	it('clamps negative drag offsets to zero', () => {
		expect(clampDragOffset(-12)).toBe(0);
		expect(clampDragOffset(0)).toBe(0);
		expect(clampDragOffset(48)).toBe(48);
	});

	it('dismisses when offset reaches the height ratio threshold', () => {
		const height = 400;
		const threshold = height * DISMISS_THRESHOLD_RATIO;
		expect(shouldDismissSheet(threshold - 1, height)).toBe(false);
		expect(shouldDismissSheet(threshold, height)).toBe(true);
	});

	it('uses fallback threshold when sheet height is zero', () => {
		expect(shouldDismissSheet(DISMISS_FALLBACK_THRESHOLD_PX - 1, 0)).toBe(false);
		expect(shouldDismissSheet(DISMISS_FALLBACK_THRESHOLD_PX, 0)).toBe(true);
	});

	it('fades overlay opacity with drag progress', () => {
		expect(overlayOpacityFromDrag(0, 200)).toBe(1);
		expect(overlayOpacityFromDrag(100, 200)).toBe(0.5);
		expect(overlayOpacityFromDrag(250, 200)).toBe(0);
		expect(overlayOpacityFromDrag(40, 0)).toBe(1);
	});

	it('skips snap-back animation when already reset to zero', () => {
		expect(needsSnapBackAnimation(0)).toBe(false);
		expect(needsSnapBackAnimation(24)).toBe(true);
	});
});
