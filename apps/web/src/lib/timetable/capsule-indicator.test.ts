import { describe, expect, it } from 'vite-plus/test';
import {
	calculateExpandedDots,
	calculateScrollingDotTrack,
	scrollingDotTrackNeedsStructureUpdate,
	type ScrollingDotTrack
} from './capsule-indicator';

const base = {
	startWeek: 1,
	endWeek: 20,
	currentAcademicWeek: 10,
	maxVisible: 4
};

function traceWeeks(weeks: readonly number[], previous?: ScrollingDotTrack): ScrollingDotTrack[] {
	let previousWindowStart = previous?.windowStart;
	return weeks.map((scrollWeek) => {
		const track = calculateScrollingDotTrack({ ...base, scrollWeek, previousWindowStart });
		previousWindowStart = track.windowStart;
		return track;
	});
}

describe('calculateScrollingDotTrack', () => {
	it('returns an empty track for an invalid range', () => {
		expect(
			calculateScrollingDotTrack({ ...base, startWeek: 5, endWeek: 4, scrollWeek: 5 })
		).toEqual({ dots: [], windowStart: 5, trackOffset: 0 });
	});

	it('initializes an aligned middle window with focus on the third dot', () => {
		const track = calculateScrollingDotTrack({ ...base, scrollWeek: 10 });
		expect(track.dots.map((dot) => dot.week)).toEqual([8, 9, 10, 11]);
		expect(track.dots.findIndex((dot) => dot.active)).toBe(2);
		expect(track.dots.filter((dot) => dot.isCurrentWeek).map((dot) => dot.week)).toEqual([10]);
		expect(track.windowStart).toBe(8);
		expect(track.trackOffset).toBe(0);
	});

	it.each([
		{
			name: 'increasing',
			seed: [8, 9, 10],
			weeks: [10.3, 10.49, 10.51, 10.9, 11, 11.6, 12],
			slot: 2
		},
		{
			name: 'decreasing',
			seed: [14, 13, 12],
			weeks: [11.7, 11.51, 11.49, 11.1, 11, 10.4, 10],
			slot: 1
		}
	])('keeps $name week numbers at the expected inner slot', ({ seed, weeks, slot }) => {
		const previous = traceWeeks(seed).at(-1);
		const tracks = traceWeeks(weeks, previous);
		tracks.forEach((track, index) => {
			const position = weeks[index] - track.dots[0].week + track.trackOffset;
			expect(position).toBeCloseTo(slot);
			expect(track.dots.find((dot) => dot.active)?.week).toBe(Math.round(weeks[index]));
		});
	});

	it.each([
		{
			weeks: [8, 9, 10, 11, 12],
			reverseWeeks: [11.9999, 11.75, 11.5, 11.25, 11],
			nextWeek: 10,
			slot: 1
		},
		{
			weeks: [12, 11, 10, 9, 8],
			reverseWeeks: [8.0001, 8.25, 8.5, 8.75, 9],
			nextWeek: 10,
			slot: 2
		}
	])(
		'keeps the window still throughout the first reversed week: $weeks',
		({ weeks, reverseWeeks, nextWeek, slot }) => {
			const previous = traceWeeks(weeks).at(-1)!;
			const reversed = traceWeeks(reverseWeeks, previous);
			for (const track of reversed) {
				expect(track.windowStart).toBeCloseTo(previous.windowStart);
				expect(track.trackOffset).toBeCloseTo(previous.trackOffset);
				expect(track.dots.map((dot) => dot.week)).toEqual(previous.dots.map((dot) => dot.week));
			}

			const settled = reversed.at(-1)!;
			expect(settled.dots.findIndex((dot) => dot.active)).toBe(slot);
			expect(
				Math.abs(
					settled.dots.findIndex((dot) => dot.active) - previous.dots.findIndex((dot) => dot.active)
				)
			).toBe(1);

			const next = traceWeeks([nextWeek], settled)[0];
			expect(next.dots.findIndex((dot) => dot.active)).toBe(slot);
			expect(Math.abs(next.windowStart - settled.windowStart)).toBeCloseTo(1);
		}
	);

	it.each([
		{ seed: [8, 9, 10], weeks: [9.8, 9.2, 9.6, 9.1, 9.9, 10] },
		{ seed: [8, 9, 10.25], weeks: [10.1, 9.75, 9.3, 9.6, 9.9, 10.25] }
	])('preserves the viewport during repeated partial reversals: $seed', ({ seed, weeks }) => {
		const previous = traceWeeks(seed).at(-1)!;
		for (const track of traceWeeks(weeks, previous)) {
			expect(track.windowStart).toBeCloseTo(previous.windowStart);
			expect(track.trackOffset).toBeCloseTo(previous.trackOffset);
			expect(track.dots.map((dot) => dot.week)).toEqual(previous.dots.map((dot) => dot.week));
		}
	});

	it.each([
		{
			seed: [8, 9, 10],
			weeks: [10.9999, 11, 11.0001],
			positions: [2.0001, 2, 1.9999]
		},
		{
			seed: [14, 13, 12],
			weeks: [11.0001, 11, 10.9999],
			positions: [0.9999, 1, 1.0001]
		}
	])(
		'keeps rendered dot positions continuous when the track rebases: $weeks',
		({ seed, weeks, positions }) => {
			const previous = traceWeeks(seed).at(-1);
			traceWeeks(weeks, previous).forEach((track, index) => {
				const dotIndex = track.dots.findIndex((dot) => dot.week === 11);
				expect(dotIndex).toBeGreaterThanOrEqual(0);
				expect(dotIndex + track.trackOffset).toBeCloseTo(positions[index], 8);
			});
		}
	);

	it.each([
		{ weeks: [10, 10.3], opacities: [0.28, 0.4, 0.82, 0.58, 0.12] },
		{ weeks: [12, 11, 10, 9.7], opacities: [0.12, 0.58, 0.82, 0.4, 0.28] }
	])('blends adjacent emphasis and fades viewport edges: $weeks', ({ weeks, opacities }) => {
		const track = traceWeeks(weeks).at(-1)!;
		expect(track.dots.map((dot) => dot.week)).toEqual([8, 9, 10, 11, 12]);
		track.dots.forEach((dot, index) => {
			expect(dot.opacity).toBeCloseTo(opacities[index]);
		});
	});

	it('lets focus reach the outer slots at semester boundaries', () => {
		const tracks = traceWeeks([18, 19, 20, 19, 18, 17, 2, 1, 2, 3, 4]);
		expect(tracks.map((track) => track.dots.findIndex((dot) => dot.active))).toEqual([
			2, 2, 3, 2, 1, 1, 1, 0, 1, 2, 2
		]);
	});

	it('clamps overscroll without introducing out-of-range dots', () => {
		const tracks = traceWeeks([-5, 1, 25, 20, -5]);
		for (const [index, track] of tracks.entries()) {
			const atStart = index < 2 || index === 4;
			expect(track.dots.map((dot) => dot.week)).toEqual(atStart ? [1, 2, 3, 4] : [17, 18, 19, 20]);
			expect(track.dots.find((dot) => dot.active)?.week).toBe(atStart ? 1 : 20);
			expect(track.trackOffset).toBe(0);
		}
	});

	it('handles direct jumps in either direction using the same window model', () => {
		const tracks = traceWeeks([1, 12, 5, 20, 1]);
		expect(tracks.map((track) => track.windowStart)).toEqual([1, 10, 4, 17, 1]);
		expect(tracks.map((track) => track.dots.findIndex((dot) => dot.active))).toEqual([
			0, 2, 1, 3, 0
		]);
	});

	it.each([5, 6, 8])('keeps all dots fixed in the short range 5–%i', (endWeek) => {
		const track = calculateScrollingDotTrack({
			...base,
			startWeek: 5,
			endWeek,
			scrollWeek: (5 + endWeek) / 2,
			previousWindowStart: 100
		});
		expect(track.dots.map((dot) => dot.week)).toEqual(
			Array.from({ length: endWeek - 4 }, (_, index) => index + 5)
		);
		expect(track.windowStart).toBe(5);
		expect(track.trackOffset).toBe(0);
		if (endWeek === 8) {
			expect(track.dots[1].opacity).toBeCloseTo(0.7);
			expect(track.dots[2].opacity).toBeCloseTo(0.7);
		}
	});

	it('reclamps the retained viewport when the semester range changes', () => {
		const track = calculateScrollingDotTrack({
			...base,
			startWeek: 100,
			endWeek: 119,
			scrollWeek: 106,
			previousWindowStart: 10
		});
		expect(track.dots.map((dot) => dot.week)).toEqual([104, 105, 106, 107]);
		expect(track.dots.findIndex((dot) => dot.active)).toBe(2);
	});
});

describe('scrollingDotTrackNeedsStructureUpdate', () => {
	it('returns false when only opacity and offset change', () => {
		const previous = calculateScrollingDotTrack({
			...base,
			scrollWeek: 10.2,
			previousWindowStart: 8
		});
		const next = calculateScrollingDotTrack({
			...base,
			scrollWeek: 10.5,
			previousWindowStart: previous.windowStart
		});

		expect(scrollingDotTrackNeedsStructureUpdate(previous, next)).toBe(false);
	});

	it('returns true when the visible week numbers change', () => {
		const previous = calculateScrollingDotTrack({ ...base, scrollWeek: 10 });
		const next = calculateScrollingDotTrack({
			...base,
			scrollWeek: 12,
			previousWindowStart: previous.windowStart
		});

		expect(scrollingDotTrackNeedsStructureUpdate(previous, next)).toBe(true);
	});
});

describe('calculateExpandedDots', () => {
	it('returns the entire semester with the selected and academic weeks', () => {
		const dots = calculateExpandedDots({
			startWeek: 1,
			endWeek: 20,
			currentWeek: 5,
			currentAcademicWeek: 2
		});
		expect(dots).toHaveLength(20);
		expect(dots.filter((dot) => dot.active).map((dot) => dot.week)).toEqual([5]);
		expect(dots.filter((dot) => dot.isCurrentWeek).map((dot) => dot.week)).toEqual([2]);
		expect(dots[4].opacity).toBe(1);
		expect(dots[0].opacity).toBe(0.4);
	});

	it('crossfades adjacent dots for fractional weeks', () => {
		const dots = calculateExpandedDots({
			startWeek: 1,
			endWeek: 20,
			currentWeek: 5.5,
			currentAcademicWeek: 2
		});
		expect(dots[4].opacity).toBeCloseTo(0.7);
		expect(dots[5].opacity).toBeCloseTo(0.7);
	});

	it('returns no dots for an invalid range', () => {
		expect(
			calculateExpandedDots({
				startWeek: 10,
				endWeek: 5,
				currentWeek: 6,
				currentAcademicWeek: 6
			})
		).toEqual([]);
	});
});
