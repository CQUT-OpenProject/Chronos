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
}

export function createWeekSliderGesture({
	getStartWeek,
	getEndWeek,
	getDisplayedWeek,
	onWeekChange,
	onJumpToCurrentWeek
}: WeekSliderGestureOptions) {
	let weekSliderVisible = $state(false);
	let dragWeek = $state(0);
	let headerContainerEl = $state<HTMLElement | null>(null);

	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let activePointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let isPressDragging = false;

	function onHeaderTap() {
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
			navigator.vibrate?.(10);
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
		onWeekChange(nextWeek);
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
		}
	}

	function onSliderCommit() {
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
		onSliderCommit,
		onHeaderTap,
		openWeekSlider
	};
}

export type WeekSliderGestureController = ReturnType<typeof createWeekSliderGesture>;
