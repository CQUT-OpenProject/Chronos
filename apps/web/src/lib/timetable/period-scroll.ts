/**
 * Calculates the scrollTop offset to center the active period within the viewport.
 */
export function calculatePeriodCenterScrollOffset({
	periodTop,
	periodHeight,
	viewportHeight,
	scrollHeight
}: {
	periodTop: number;
	periodHeight: number;
	viewportHeight: number;
	scrollHeight?: number;
}): number {
	if (viewportHeight <= 0 || periodHeight <= 0) return 0;

	const periodCenter = periodTop + periodHeight / 2;
	const idealOffset = Math.max(0, periodCenter - viewportHeight / 2);

	if (scrollHeight != null && scrollHeight > 0) {
		const maxScroll = Math.max(0, scrollHeight - viewportHeight);
		return Math.min(idealOffset, maxScroll);
	}

	return idealOffset;
}

/**
 * Calculates the period top and height given a 1-based period index and row height.
 */
export function calculatePeriodOffsetByIndex({
	periodIndex,
	rowHeightPx,
	viewportHeight,
	scrollHeight
}: {
	periodIndex: number;
	rowHeightPx: number;
	viewportHeight: number;
	scrollHeight?: number;
}): number {
	if (periodIndex < 1 || rowHeightPx <= 0 || viewportHeight <= 0) return 0;
	const periodTop = (periodIndex - 1) * rowHeightPx;
	return calculatePeriodCenterScrollOffset({
		periodTop,
		periodHeight: rowHeightPx,
		viewportHeight,
		scrollHeight
	});
}
