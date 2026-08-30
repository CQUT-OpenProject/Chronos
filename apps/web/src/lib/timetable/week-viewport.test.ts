import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { createCourse, createTimetable } from '@chronos/core';
import { buildWeekViewport, createWeekLayoutCache } from './week-viewport';

const computeTimetableWeekLayout = vi.fn();

vi.mock('@chronos/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@chronos/core')>();
	return {
		...actual,
		computeTimetableWeekLayout: (...args: unknown[]) => computeTimetableWeekLayout(...args)
	};
});

describe('buildWeekViewport', () => {
	const sampleTimetable = createTimetable({
		id: 'tt-viewport',
		name: 'Viewport Test',
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: [{ index: 1, startTime: '08:00', endTime: '08:45' }]
		},
		courses: [
			createCourse({
				id: 'c-1',
				name: '数据结构',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 1,
				weeks: [2, 3]
			})
		]
	});

	const layoutForWeek = (week: number) => ({
		gridModel: { visibleDays: [], periods: [], displayedPeriodCount: 1 },
		courseDisplayModels: [{ course: sampleTimetable.courses[0]!, week }],
		placements: [],
		weekRangeText: `week-${week}`,
		isCurrentWeek: week === 2,
		academicWeek: 2
	});

	beforeEach(() => {
		computeTimetableWeekLayout.mockReset();
		computeTimetableWeekLayout.mockImplementation(({ displayedWeek }: { displayedWeek: number }) =>
			layoutForWeek(displayedWeek)
		);
	});

	it('returns empty maps without a timetable', () => {
		const cache = createWeekLayoutCache();
		const result = buildWeekViewport(
			{
				timetable: null,
				todayIso: '2026-03-02',
				displayedWeek: 2,
				expandedSlotKeys: new Set()
			},
			cache
		);

		expect(result.weekLayouts.size).toBe(0);
		expect(computeTimetableWeekLayout).not.toHaveBeenCalled();
	});

	it('builds layouts for displayed week and adjacent weeks', () => {
		const cache = createWeekLayoutCache();
		const result = buildWeekViewport(
			{
				timetable: sampleTimetable,
				todayIso: '2026-03-02',
				displayedWeek: 2,
				expandedSlotKeys: new Set()
			},
			cache
		);

		expect([...result.weekLayouts.keys()]).toEqual([1, 2, 3]);
		expect(computeTimetableWeekLayout).toHaveBeenCalledTimes(3);
	});

	it('reuses cached week layouts for repeated calls', () => {
		const cache = createWeekLayoutCache();
		const input = {
			timetable: sampleTimetable,
			todayIso: '2026-03-02',
			displayedWeek: 2,
			expandedSlotKeys: new Set<string>()
		};

		buildWeekViewport(input, cache);
		buildWeekViewport(input, cache);

		expect(computeTimetableWeekLayout).toHaveBeenCalledTimes(3);
	});

	it('recomputes when expanded slot keys change', () => {
		const cache = createWeekLayoutCache();
		const baseInput = {
			timetable: sampleTimetable,
			todayIso: '2026-03-02',
			displayedWeek: 2,
			expandedSlotKeys: new Set<string>()
		};

		buildWeekViewport(baseInput, cache);
		buildWeekViewport({ ...baseInput, expandedSlotKeys: new Set(['1:1:1']) }, cache);

		expect(computeTimetableWeekLayout).toHaveBeenCalledTimes(6);
	});

	it('invalidateAll clears cached layouts', () => {
		const cache = createWeekLayoutCache();
		const input = {
			timetable: sampleTimetable,
			todayIso: '2026-03-02',
			displayedWeek: 2,
			expandedSlotKeys: new Set<string>()
		};

		buildWeekViewport(input, cache);
		cache.invalidateAll();
		buildWeekViewport(input, cache);

		expect(computeTimetableWeekLayout).toHaveBeenCalledTimes(6);
	});
});
