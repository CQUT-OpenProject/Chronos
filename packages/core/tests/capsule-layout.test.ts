import { describe, it, expect } from 'vite-plus/test';
import {
	createCourse,
	placeCapsules,
	resolveCapsuleTypeScale,
	parseLocationParts,
	locationDisplayLines,
	applyCapsuleCornerRounding,
	applyCapsuleSquareCorners,
	type PlacedCourseCapsule,
	type PlacedOverlapPlaceholder
} from '../src/index';

describe('Capsule Layout Engine in @chronos/core', () => {
	it('parses location parts into campus, building, room', () => {
		const parts = parseLocationParts('花溪校区 弘远楼A0213');
		expect(parts.campus).toBe('花溪校区');
		expect(parts.building).toBe('弘远楼');
		expect(parts.room).toBe('A0213');

		const linesWithCampus = locationDisplayLines('花溪校区 弘远楼A0213', { includeCampus: true });
		expect(linesWithCampus).toEqual(['花溪校区', '弘远楼', 'A0213']);

		const linesNoCampus = locationDisplayLines('花溪校区 弘远楼A0213', { includeCampus: false });
		expect(linesNoCampus).toEqual(['弘远楼', 'A0213']);
	});

	it('resolves capsule type scale based on column width', () => {
		const wideScale = resolveCapsuleTypeScale(100, 1, false);
		const narrowScale = resolveCapsuleTypeScale(60, 1, false);
		const compactScale = resolveCapsuleTypeScale(100, 1, true);

		expect(wideScale.titlePx).toBeGreaterThan(narrowScale.titlePx);
		expect(compactScale.titlePx).toBeLessThan(wideScale.titlePx);
	});

	it('places non-overlapping courses with full width', () => {
		const course = createCourse({
			id: 'c1',
			name: '大学物理',
			teacher: '李老师',
			location: '第一教学楼101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1]
		});

		const items = placeCapsules({
			courseDisplayModels: [{ course, isInDisplayedWeek: true }],
			visibleDays: [
				{ dayOfWeek: 1 },
				{ dayOfWeek: 2 },
				{ dayOfWeek: 3 },
				{ dayOfWeek: 4 },
				{ dayOfWeek: 5 }
			],
			columnWidthPx: 70,
			expandedSlotKeys: new Set()
		});

		expect(items.length).toBe(1);
		const placed = items[0] as PlacedCourseCapsule;
		expect(placed.kind).toBe('course');
		expect(placed.course.id).toBe('c1');
		expect(placed.geometry.widthPercent).toBe(20); // 100 / 5 = 20%
		expect(placed.geometry.startPeriod).toBe(1);
		expect(placed.geometry.endPeriod).toBe(2);
		expect(placed.corners.topLeft).toBe(true);
	});

	it('creates overlap placeholder when slot is collapsed', () => {
		const c1 = createCourse({
			id: 'c1',
			name: '课程A',
			teacher: 'A',
			location: 'L1',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1]
		});
		const c2 = createCourse({
			id: 'c2',
			name: '课程B',
			teacher: 'B',
			location: 'L2',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1]
		});

		const items = placeCapsules({
			courseDisplayModels: [
				{ course: c1, isInDisplayedWeek: true },
				{ course: c2, isInDisplayedWeek: true }
			],
			visibleDays: [{ dayOfWeek: 1 }, { dayOfWeek: 2 }],
			columnWidthPx: 100,
			expandedSlotKeys: new Set() // not expanded
		});

		expect(items.length).toBe(1);
		const placeholder = items[0] as PlacedOverlapPlaceholder;
		expect(placeholder.kind).toBe('overlap-placeholder');
		expect(placeholder.count).toBe(2);
	});

	it('expands overlapping courses side-by-side when slot is expanded', () => {
		const c1 = createCourse({
			id: 'c1',
			name: '课程A',
			teacher: 'A',
			location: 'L1',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1]
		});
		const c2 = createCourse({
			id: 'c2',
			name: '课程B',
			teacher: 'B',
			location: 'L2',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1]
		});

		const items = placeCapsules({
			courseDisplayModels: [
				{ course: c1, isInDisplayedWeek: true },
				{ course: c2, isInDisplayedWeek: true }
			],
			visibleDays: [{ dayOfWeek: 1 }, { dayOfWeek: 2 }],
			columnWidthPx: 100,
			expandedSlotKeys: new Set(['1-1-2']) // expanded
		});

		expect(items.length).toBe(2);
		const p1 = items[0] as PlacedCourseCapsule;
		const p2 = items[1] as PlacedCourseCapsule;
		expect(p1.kind).toBe('course');
		expect(p2.kind).toBe('course');
		expect(p1.geometry.widthPercent).toBe(25); // 50% / 2 = 25%
		expect(p2.geometry.widthPercent).toBe(25);
		expect(p2.geometry.leftPercent).toBe(25);
	});

	it('calculates adjacent corner rounding and square corners', () => {
		const items = [
			{
				geometry: { leftPercent: 0, widthPercent: 20, startPeriod: 1, endPeriod: 2 },
				corners: { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true }
			},
			{
				geometry: { leftPercent: 0, widthPercent: 20, startPeriod: 3, endPeriod: 4 },
				corners: { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true }
			}
		];

		applyCapsuleCornerRounding(items);
		// Bottom of item 0 touches top of item 1
		expect(items[0]?.corners.bottomLeft).toBe(false);
		expect(items[0]?.corners.bottomRight).toBe(false);
		expect(items[1]?.corners.topLeft).toBe(false);
		expect(items[1]?.corners.topRight).toBe(false);

		applyCapsuleSquareCorners(items);
		expect(items[0]?.corners.topLeft).toBe(false);
		expect(items[0]?.corners.topRight).toBe(false);
	});
});
