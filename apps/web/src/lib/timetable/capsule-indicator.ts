export interface IndicatorDot {
	week: number;
	active: boolean;
	isCurrentWeek: boolean;
	scale: number;
	opacity: number;
}

export interface ScrollingDotTrack {
	dots: IndicatorDot[];
	/** Continuous week coordinate at the left edge of the viewport. */
	windowStart: number;
	trackOffset: number;
}

export interface CalculateScrollingDotTrackOptions {
	startWeek: number;
	endWeek: number;
	scrollWeek: number;
	/** Carry the returned windowStart into the next update to preserve the viewport. */
	previousWindowStart?: number;
	currentAcademicWeek: number;
	maxVisible?: number;
}

const INACTIVE_OPACITY = 0.4;
const ACTIVE_OPACITY = 1.0;

function createDot(week: number, displayedWeek: number, currentAcademicWeek: number): IndicatorDot {
	const emphasis = Math.max(0, 1 - Math.abs(week - displayedWeek));
	return {
		week,
		active: week === Math.round(displayedWeek),
		isCurrentWeek: week === currentAcademicWeek,
		scale: 1.0,
		opacity: INACTIVE_OPACITY + (ACTIVE_OPACITY - INACTIVE_OPACITY) * emphasis
	};
}

export function calculateScrollingDotTrack({
	startWeek,
	endWeek,
	scrollWeek,
	previousWindowStart,
	currentAcademicWeek,
	maxVisible = 4
}: CalculateScrollingDotTrackOptions): ScrollingDotTrack {
	if (startWeek > endWeek) {
		return { dots: [], windowStart: startWeek, trackOffset: 0 };
	}

	const visibleCount = Math.min(maxVisible, endWeek - startWeek + 1);
	const clampedWeek = Math.max(startWeek, Math.min(endWeek, scrollWeek));
	const leftSlot = Math.floor((visibleCount - 1) / 2);
	const rightSlot = Math.ceil((visibleCount - 1) / 2);

	// Keep the viewport still while the focus moves between its inner slots.
	// Pan only when it leaves that band: increasing weeks settle at slot 2,
	// decreasing weeks at slot 1 (zero-based, with four visible dots).
	const retainedStart = Math.max(
		clampedWeek - rightSlot,
		Math.min(clampedWeek - leftSlot, previousWindowStart ?? clampedWeek - rightSlot)
	);
	const windowStart = Math.max(startWeek, Math.min(endWeek - visibleCount + 1, retainedStart));
	const firstWeek = Math.floor(windowStart);
	const lastWeek = Math.min(endWeek, Math.ceil(windowStart + visibleCount - 1));
	const dots: IndicatorDot[] = [];

	for (let week = firstWeek; week <= lastWeek; week += 1) {
		const dot = createDot(week, clampedWeek, currentAcademicWeek);
		const position = week - windowStart;
		const visibility = Math.min(1, position + 1, visibleCount - position);
		dots.push({ ...dot, opacity: dot.opacity * visibility });
	}

	return { dots, windowStart, trackOffset: firstWeek - windowStart };
}

export function scrollingDotTrackNeedsStructureUpdate(
	prev: ScrollingDotTrack,
	next: ScrollingDotTrack
): boolean {
	if (prev.dots.length !== next.dots.length) return true;
	return prev.dots.some((dot, index) => dot.week !== next.dots[index]?.week);
}

export function applyScrollingDotTrackVisual(
	track: ScrollingDotTrack,
	container: HTMLElement
): void {
	const trackEl = container.querySelector<HTMLElement>('.dots-track--compact');
	if (!trackEl) return;
	trackEl.style.setProperty('--track-offset', String(track.trackOffset));
	for (const dot of track.dots) {
		const el = trackEl.querySelector<HTMLElement>(`[data-week="${dot.week}"]`);
		if (el) el.style.opacity = String(dot.opacity);
	}
}

export function calculateExpandedDots({
	startWeek,
	endWeek,
	currentWeek,
	currentAcademicWeek
}: {
	startWeek: number;
	endWeek: number;
	currentWeek: number;
	currentAcademicWeek: number;
}): IndicatorDot[] {
	if (startWeek > endWeek) return [];
	const clampedWeek = Math.max(startWeek, Math.min(endWeek, currentWeek));
	const dots: IndicatorDot[] = [];
	for (let week = startWeek; week <= endWeek; week += 1) {
		dots.push(createDot(week, clampedWeek, currentAcademicWeek));
	}
	return dots;
}
