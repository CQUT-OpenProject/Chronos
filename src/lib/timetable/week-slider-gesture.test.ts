import { describe, expect, it, vi } from 'vite-plus/test';
import {
	canOpenWeekSlider,
	createWeekSliderGesture,
	weekFromClientX
} from './week-slider-gesture.svelte';

describe('canOpenWeekSlider', () => {
	it('allows opening when start week is before end week', () => {
		expect(canOpenWeekSlider(1, 16)).toBe(true);
	});

	it('blocks opening when start week equals end week', () => {
		expect(canOpenWeekSlider(5, 5)).toBe(false);
	});

	it('blocks opening when start week is after end week', () => {
		expect(canOpenWeekSlider(10, 5)).toBe(false);
	});
});

describe('weekFromClientX', () => {
	it('maps clientX across the header width to week numbers', () => {
		expect(
			weekFromClientX({
				clientX: 0,
				rectLeft: 0,
				rectWidth: 100,
				startWeek: 1,
				endWeek: 10
			})
		).toBe(1);

		expect(
			weekFromClientX({
				clientX: 100,
				rectLeft: 0,
				rectWidth: 100,
				startWeek: 1,
				endWeek: 10
			})
		).toBe(10);

		expect(
			weekFromClientX({
				clientX: 50,
				rectLeft: 0,
				rectWidth: 100,
				startWeek: 1,
				endWeek: 10
			})
		).toBe(6);
	});

	it('returns null when rect width is zero', () => {
		expect(
			weekFromClientX({
				clientX: 50,
				rectLeft: 0,
				rectWidth: 0,
				startWeek: 1,
				endWeek: 10
			})
		).toBeNull();
	});
});

describe('createWeekSliderGesture feedback decoupling', () => {
	it('invokes onSliderOpenFeedback on long press activation', () => {
		vi.useFakeTimers();
		const onSliderOpenFeedback = vi.fn();
		const gesture = createWeekSliderGesture({
			getStartWeek: () => 1,
			getEndWeek: () => 10,
			getDisplayedWeek: () => 1,
			onWeekChange: vi.fn(),
			onJumpToCurrentWeek: vi.fn(),
			onSliderOpenFeedback
		});

		gesture.onPointerDown({
			button: 0,
			pointerId: 1,
			clientX: 10,
			clientY: 10,
			currentTarget: null
		} as unknown as PointerEvent);

		vi.advanceTimersByTime(350);
		expect(onSliderOpenFeedback).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});
});
