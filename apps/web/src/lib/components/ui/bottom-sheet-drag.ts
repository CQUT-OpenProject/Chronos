export const DISMISS_THRESHOLD_RATIO = 0.25;
export const DISMISS_FALLBACK_THRESHOLD_PX = 80;

export function clampDragOffset(deltaY: number): number {
	return Math.max(0, deltaY);
}

export function shouldDismissSheet(
	offsetPx: number,
	sheetHeightPx: number,
	ratio = DISMISS_THRESHOLD_RATIO
): boolean {
	if (sheetHeightPx <= 0) {
		return offsetPx >= DISMISS_FALLBACK_THRESHOLD_PX;
	}
	return offsetPx >= sheetHeightPx * ratio;
}

export function overlayOpacityFromDrag(offsetPx: number, sheetHeightPx: number): number {
	if (sheetHeightPx <= 0) return 1;
	return Math.max(0, 1 - offsetPx / sheetHeightPx);
}
