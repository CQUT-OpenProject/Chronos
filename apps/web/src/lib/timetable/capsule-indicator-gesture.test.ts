import { describe, expect, it, vi } from 'vite-plus/test';
import { createCapsuleIndicatorGesture } from './capsule-indicator-gesture.svelte';

describe('createCapsuleIndicatorGesture', () => {
	it('activates scrubbing on long press and fires feedback', () => {
		vi.useFakeTimers();
		const onScrubStartFeedback = vi.fn();
		const onWeekChange = vi.fn();
		const gesture = createCapsuleIndicatorGesture({
			getStartWeek: () => 1,
			getEndWeek: () => 20,
			getDisplayedWeek: () => 3,
			onWeekChange,
			onScrubStartFeedback
		});

		gesture.onPointerDown({
			button: 0,
			pointerId: 1,
			clientX: 50,
			clientY: 50
		} as unknown as PointerEvent);

		expect(gesture.isScrubbing).toBe(false);
		vi.advanceTimersByTime(220);

		expect(gesture.isScrubbing).toBe(true);
		expect(onScrubStartFeedback).toHaveBeenCalledOnce();
		expect(gesture.scrubWeek).toBe(3);
		expect(onWeekChange).not.toHaveBeenCalled();

		vi.useRealTimers();
	});

	it('preserves current week on long-press activation regardless of touch coordinates', () => {
		vi.useFakeTimers();
		const onWeekChange = vi.fn();
		const gesture = createCapsuleIndicatorGesture({
			getStartWeek: () => 1,
			getEndWeek: () => 20,
			getDisplayedWeek: () => 7,
			onWeekChange
		});

		// Touch at far right of screen
		gesture.onPointerDown({
			button: 0,
			pointerId: 1,
			clientX: 350,
			clientY: 50
		} as unknown as PointerEvent);

		vi.advanceTimersByTime(220);

		// Must remain on week 7 upon activation
		expect(gesture.isScrubbing).toBe(true);
		expect(gesture.scrubWeek).toBe(7);
		expect(onWeekChange).not.toHaveBeenCalled();

		vi.useRealTimers();
	});

	it('does not change week on quick tap', () => {
		vi.useFakeTimers();
		const onWeekChange = vi.fn();
		const gesture = createCapsuleIndicatorGesture({
			getStartWeek: () => 1,
			getEndWeek: () => 20,
			getDisplayedWeek: () => 1,
			onWeekChange
		});

		gesture.onPointerDown({
			button: 0,
			pointerId: 1,
			clientX: 50,
			clientY: 50
		} as unknown as PointerEvent);

		vi.advanceTimersByTime(100);

		gesture.onPointerUp({
			pointerId: 1
		} as unknown as PointerEvent);

		expect(gesture.isScrubbing).toBe(false);
		expect(onWeekChange).not.toHaveBeenCalled();

		vi.useRealTimers();
	});

	it('cancels long-press when pointer moves before timer expires', () => {
		vi.useFakeTimers();
		const onScrubStartFeedback = vi.fn();
		const gesture = createCapsuleIndicatorGesture({
			getStartWeek: () => 1,
			getEndWeek: () => 20,
			getDisplayedWeek: () => 1,
			onWeekChange: vi.fn(),
			onScrubStartFeedback
		});

		gesture.onPointerDown({
			button: 0,
			pointerId: 1,
			clientX: 50,
			clientY: 50
		} as unknown as PointerEvent);

		// Move 15px horizontally before timer
		gesture.onPointerMove({
			pointerId: 1,
			clientX: 65,
			clientY: 50
		} as unknown as PointerEvent);

		vi.advanceTimersByTime(250);
		expect(gesture.isScrubbing).toBe(false);
		expect(onScrubStartFeedback).not.toHaveBeenCalled();

		vi.useRealTimers();
	});

	it('flushes target week change on pointer up after scrubbing', () => {
		vi.useFakeTimers();
		const onWeekChange = vi.fn();
		const gesture = createCapsuleIndicatorGesture({
			getStartWeek: () => 1,
			getEndWeek: () => 20,
			getDisplayedWeek: () => 1,
			onWeekChange
		});

		gesture.containerEl = {
			getBoundingClientRect: () =>
				({
					left: 0,
					top: 0,
					width: 200,
					height: 32,
					right: 200,
					bottom: 32
				}) as DOMRect,
			setPointerCapture: vi.fn(),
			releasePointerCapture: vi.fn(),
			hasPointerCapture: vi.fn().mockReturnValue(true)
		} as unknown as HTMLElement;

		gesture.onPointerDown({
			button: 0,
			pointerId: 1,
			clientX: 10,
			clientY: 16
		} as unknown as PointerEvent);

		vi.advanceTimersByTime(220);
		expect(gesture.isScrubbing).toBe(true);

		// Move to right edge
		gesture.onPointerMove({
			pointerId: 1,
			clientX: 195,
			clientY: 16,
			preventDefault: vi.fn()
		} as unknown as PointerEvent);

		expect(gesture.scrubWeek).toBe(20);

		gesture.onPointerUp({
			pointerId: 1
		} as unknown as PointerEvent);

		expect(gesture.isScrubbing).toBe(false);
		expect(onWeekChange).toHaveBeenCalledWith(20);

		vi.useRealTimers();
	});
});
