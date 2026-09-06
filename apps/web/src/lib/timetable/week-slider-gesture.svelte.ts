import { haptic } from '$lib/haptic/haptic';
import { createRafCoalescer } from '$lib/utils/raf-coalescer';
import { createThrottledCallback } from '$lib/utils/throttle';

export interface WeekFromClientXInput {
	clientX: number;
	rectLeft: number;
	rectWidth: number;
	startWeek: number;
	endWeek: number;
}

export function canOpenWeekSlider(startWeek: number, endWeek: number): boolean {
	return startWeek < endWeek;
}

export function weekFromClientX({
	clientX,
	rectLeft,
	rectWidth,
	startWeek,
	endWeek
}: WeekFromClientXInput): number | null {
	if (rectWidth <= 0) return null;
	const pct = Math.max(0, Math.min(1, (clientX - rectLeft) / rectWidth));
	const calculatedWeek = Math.round(startWeek + pct * (endWeek - startWeek));
	return Math.max(startWeek, Math.min(endWeek, calculatedWeek));
}

export interface WeekSliderGestureOptions {
	getStartWeek: () => number;
	getEndWeek: () => number;
	getDisplayedWeek: () => number;
	onWeekChange: (week: number) => void;
	onJumpToCurrentWeek: () => void;
	onSliderOpenFeedback?: () => void;
	onWeekStepFeedback?: () => void;
}

function trySetPointerCapture(target: HTMLElement | null, pointerId: number): void {
	if (target?.setPointerCapture) {
		try {
			target.setPointerCapture(pointerId);
		} catch {
			// Ignore
		}
	}
}

function tryReleasePointerCapture(element: HTMLElement | null, pointerId: number): void {
	if (element && element.hasPointerCapture(pointerId)) {
		try {
			element.releasePointerCapture(pointerId);
		} catch {
			// Ignore
		}
	}
}

export function createWeekSliderGesture({
	getStartWeek,
	getEndWeek,
	getDisplayedWeek,
	onWeekChange,
	onJumpToCurrentWeek,
	onSliderOpenFeedback = () => haptic.medium(),
	onWeekStepFeedback = () => haptic.light()
}: WeekSliderGestureOptions) {
	let weekSliderVisible = $state(false);
	let dragWeek = $state(0);
	let headerContainerEl = $state<HTMLElement | null>(null);

	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let activePointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let isPressDragging = false;

	const weekChangeRaf = createRafCoalescer(onWeekChange);
	const triggerStepFeedback = createThrottledCallback(onWeekStepFeedback, 40);

	function applyWeekStep(week: number): void {
		if (dragWeek === week) return;
		dragWeek = week;
		triggerStepFeedback();
		weekChangeRaf.schedule(week);
	}

	function onHeaderTap() {
		weekChangeRaf.cancel();
		if (weekSliderVisible) {
			weekSliderVisible = false;
			return;
		}
		onJumpToCurrentWeek();
	}

	function onPointerDown(e: PointerEvent) {
		const startWeek = getStartWeek();
		const endWeek = getEndWeek();
		if (e.button !== 0 || startWeek >= endWeek) return;
		activePointerId = e.pointerId;
		startX = e.clientX;
		startY = e.clientY;
		isPressDragging = false;

		trySetPointerCapture(e.currentTarget as HTMLElement | null, e.pointerId);

		if (longPressTimer) clearTimeout(longPressTimer);
		longPressTimer = setTimeout(() => {
			onSliderOpenFeedback();
			dragWeek = getDisplayedWeek();
			weekSliderVisible = true;
			isPressDragging = true;
			longPressTimer = null;
		}, 350);
	}

	function updateWeekFromClientX(clientX: number) {
		if (!headerContainerEl) return;
		const rect = headerContainerEl.getBoundingClientRect();
		const nextWeek = weekFromClientX({
			clientX,
			rectLeft: rect.left,
			rectWidth: rect.width,
			startWeek: getStartWeek(),
			endWeek: getEndWeek()
		});
		if (nextWeek == null) return;
		applyWeekStep(nextWeek);
	}

	function onWindowPointerMove(e: PointerEvent) {
		if (activePointerId !== e.pointerId) return;

		if (!isPressDragging) {
			const dx = Math.abs(e.clientX - startX);
			const dy = Math.abs(e.clientY - startY);
			if (dx > 8 || dy > 8) {
				if (longPressTimer) {
					clearTimeout(longPressTimer);
					longPressTimer = null;
				}
				tryReleasePointerCapture(headerContainerEl, e.pointerId);
			}
			return;
		}

		e.preventDefault();
		updateWeekFromClientX(e.clientX);
	}

	function finishPointerInteraction(pointerId: number, flushDrag: boolean) {
		tryReleasePointerCapture(headerContainerEl, pointerId);
		activePointerId = null;

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
			onHeaderTap();
		} else if (flushDrag && isPressDragging) {
			isPressDragging = false;
			weekSliderVisible = false;
			weekChangeRaf.flush(dragWeek);
		}
	}

	function onWindowPointerUp(e: PointerEvent) {
		if (activePointerId !== e.pointerId) return;
		finishPointerInteraction(e.pointerId, true);
	}

	function onWindowPointerCancel(e: PointerEvent) {
		if (activePointerId !== e.pointerId) return;
		finishPointerInteraction(e.pointerId, true);
	}

	function onSliderValueChange(week: number) {
		applyWeekStep(week);
	}

	function onSliderCommit(week?: number) {
		const targetWeek = typeof week === 'number' ? week : dragWeek;
		weekChangeRaf.flush(targetWeek);
		weekSliderVisible = false;
	}

	function openWeekSlider(): boolean {
		if (!canOpenWeekSlider(getStartWeek(), getEndWeek())) return false;
		dragWeek = getDisplayedWeek();
		weekSliderVisible = true;
		return true;
	}

	return {
		get weekSliderVisible() {
			return weekSliderVisible;
		},
		get dragWeek() {
			return dragWeek;
		},
		set dragWeek(value: number) {
			dragWeek = value;
		},
		get headerContainerEl() {
			return headerContainerEl;
		},
		set headerContainerEl(value: HTMLElement | null) {
			headerContainerEl = value;
		},
		onPointerDown,
		onWindowPointerMove,
		onWindowPointerUp,
		onWindowPointerCancel,
		onSliderValueChange,
		onSliderCommit,
		onHeaderTap,
		openWeekSlider
	};
}
