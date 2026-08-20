import { haptic } from '$lib/haptic/haptic';

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
	let pendingWeekChange: number | null = null;
	let rafHandle: number | null = null;
	let activePointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let isPressDragging = false;
	let lastHapticTime = -Infinity;

	const HAPTIC_THROTTLE_MS = 40;

	function triggerStepFeedback() {
		const now = Date.now();
		if (now - lastHapticTime >= HAPTIC_THROTTLE_MS) {
			lastHapticTime = now;
			onWeekStepFeedback();
		}
	}

	function scheduleWeekChange(week: number) {
		pendingWeekChange = week;
		if (rafHandle == null) {
			const requestFrame =
				typeof requestAnimationFrame === 'function'
					? requestAnimationFrame
					: (cb: FrameRequestCallback) => setTimeout(cb, 0);
			rafHandle = requestFrame(() => {
				rafHandle = null;
				if (pendingWeekChange != null) {
					const target = pendingWeekChange;
					pendingWeekChange = null;
					onWeekChange(target);
				}
			});
		}
	}

	function flushWeekChange(week: number) {
		if (rafHandle != null) {
			const cancelFrame =
				typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;
			cancelFrame(rafHandle);
			rafHandle = null;
		}
		pendingWeekChange = null;
		onWeekChange(week);
	}

	function onHeaderTap() {
		if (rafHandle != null) {
			const cancelFrame =
				typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : clearTimeout;
			cancelFrame(rafHandle);
			rafHandle = null;
		}
		pendingWeekChange = null;
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

		const target = e.currentTarget as HTMLElement | null;
		if (target?.setPointerCapture) {
			try {
				target.setPointerCapture(e.pointerId);
			} catch {
				// Ignore
			}
		}

		if (longPressTimer) clearTimeout(longPressTimer);
		longPressTimer = setTimeout(() => {
			onSliderOpenFeedback();
			dragWeek = getDisplayedWeek();
			weekSliderVisible = true;
			isPressDragging = true;
			longPressTimer = null;
		}, 350);
	}

	function releaseCapture(pointerId: number) {
		if (headerContainerEl && headerContainerEl.hasPointerCapture(pointerId)) {
			try {
				headerContainerEl.releasePointerCapture(pointerId);
			} catch {
				// Ignore
			}
		}
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
		if (nextWeek == null || dragWeek === nextWeek) return;
		dragWeek = nextWeek;
		triggerStepFeedback();
		scheduleWeekChange(nextWeek);
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
				releaseCapture(e.pointerId);
			}
			return;
		}

		e.preventDefault();
		updateWeekFromClientX(e.clientX);
	}

	function onWindowPointerUp(e: PointerEvent) {
		if (activePointerId !== e.pointerId) return;
		releaseCapture(e.pointerId);
		activePointerId = null;

		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
			onHeaderTap();
		} else if (isPressDragging) {
			isPressDragging = false;
			weekSliderVisible = false;
			flushWeekChange(dragWeek);
		}
	}

	function onWindowPointerCancel(e: PointerEvent) {
		if (activePointerId !== e.pointerId) return;
		releaseCapture(e.pointerId);
		activePointerId = null;
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
		if (isPressDragging) {
			isPressDragging = false;
			weekSliderVisible = false;
			flushWeekChange(dragWeek);
		}
	}

	function onSliderValueChange(week: number) {
		if (dragWeek === week) return;
		dragWeek = week;
		triggerStepFeedback();
		scheduleWeekChange(week);
	}

	function onSliderCommit(week?: number) {
		const targetWeek = typeof week === 'number' ? week : dragWeek;
		flushWeekChange(targetWeek);
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

export type WeekSliderGestureController = ReturnType<typeof createWeekSliderGesture>;
