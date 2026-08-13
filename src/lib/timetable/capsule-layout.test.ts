import { describe, expect, it } from 'vite-plus/test';
import {
	buildSlotGroups,
	locationDisplayLines,
	parseLocationParts,
	placeCapsules,
	resolveCapsuleTypeScale,
	resolveLocationBlockMetrics,
	shouldShowLocationCampus
} from './capsule-layout';
import { EASTER_EGG_PALETTE_ENTRIES } from '$lib/parsers/course-palette';
import { periodSlotKey } from './slot-key';

describe('resolveCapsuleTypeScale', () => {
	it('uses the wide-column tier at effective >= 110', () => {
		const scale = resolveCapsuleTypeScale(110);
		expect(scale.titlePx).toBe(17);
		expect(scale.detailPx).toBe(12);
		expect(scale.badgePx).toBe(12);
	});

	it('uses the narrow-column tier near 70px', () => {
		const scale = resolveCapsuleTypeScale(70);
		expect(scale.titlePx).toBe(14);
		expect(scale.detailPx).toBe(10);
		expect(scale.badgePx).toBe(9);
	});

	it('interpolates between anchors', () => {
		const scale = resolveCapsuleTypeScale(85);
		expect(scale.titlePx).toBe(15);
		expect(scale.detailPx).toBe(11);
		expect(scale.badgePx).toBe(10);
	});

	it('clamps below the lowest anchor', () => {
		const scale = resolveCapsuleTypeScale(40);
		expect(scale.titlePx).toBe(12);
		expect(scale.detailPx).toBe(8);
		expect(scale.badgePx).toBe(8);
		expect(scale.placeholderPx).toBe(11);
	});

	it('shrinks when overlap splits the column', () => {
		const single = resolveCapsuleTypeScale(140, 1);
		const overlapped = resolveCapsuleTypeScale(140, 2);
		expect(overlapped.titlePx).toBeLessThan(single.titlePx);
		expect(overlapped.detailPx).toBeLessThanOrEqual(single.detailPx);
	});

	it('wide 7-column layout outsizes a narrow 5-column layout', () => {
		const wideSeven = resolveCapsuleTypeScale(770 / 7, 1);
		const narrowFive = resolveCapsuleTypeScale(320 / 5, 1);
		expect(wideSeven.titlePx).toBeGreaterThan(narrowFive.titlePx);
		expect(wideSeven.detailPx).toBeGreaterThan(narrowFive.detailPx);
	});

	it('compact shrinks one fixed tier', () => {
		const scroll = resolveCapsuleTypeScale(110);
		const fit = resolveCapsuleTypeScale(110, 1, true);
		expect(fit.titlePx).toBe(15);
		expect(fit.detailPx).toBe(11);
		expect(fit.badgePx).toBe(11);
		expect(fit.titlePx).toBeLessThan(scroll.titlePx);
		expect(fit.detailPx).toBeLessThan(scroll.detailPx);
	});

	it('compact clamps at the smallest tier floors', () => {
		const floor = resolveCapsuleTypeScale(50, 1, true);
		expect(floor.titlePx).toBe(12);
		expect(floor.detailPx).toBe(8);
		expect(floor.badgePx).toBe(8);
	});

	it('hides campus below the 70px threshold', () => {
		expect(shouldShowLocationCampus(70, 1)).toBe(true);
		expect(shouldShowLocationCampus(69, 1)).toBe(false);
		expect(shouldShowLocationCampus(120, 2)).toBe(false);
	});

	it('keeps a 3-line location slot and bumps font when campus is hidden', () => {
		const withCampus = resolveLocationBlockMetrics(10, true, 3);
		const withoutCampus = resolveLocationBlockMetrics(10, false, 2);
		expect(withoutCampus.heightPx).toBe(withCampus.heightPx);
		expect(withoutCampus.fontPx).toBeGreaterThan(withCampus.fontPx);
	});
});

describe('slot and location helpers', () => {
	it('buildSlotGroups groups overlapping courses on the same day', () => {
		const groups = buildSlotGroups([
			courseModel('a', 1, 1, 2),
			courseModel('b', 1, 2, 3),
			courseModel('c', 2, 1, 2)
		]);

		expect(groups).toHaveLength(2);
		expect(groups[0]?.courses.map((entry) => entry.course.id)).toEqual(['a', 'b']);
		expect(groups[1]?.courses.map((entry) => entry.course.id)).toEqual(['c']);
	});

	it('parseLocationParts splits campus, building, and room', () => {
		expect(parseLocationParts('两江校区 弘远楼A0213')).toEqual({
			campus: '两江校区',
			building: '弘远楼',
			room: 'A0213'
		});
		expect(parseLocationParts('弘远楼B0216')).toEqual({
			campus: '',
			building: '弘远楼',
			room: 'B0216'
		});
		expect(parseLocationParts('第一教学楼 A101')).toEqual({
			campus: '',
			building: '第一教学楼',
			room: 'A101'
		});
		expect(parseLocationParts('B201')).toEqual({
			campus: '',
			building: '',
			room: 'B201'
		});
		expect(locationDisplayLines('两江校区 弘远楼A0213')).toEqual(['两江校区', '弘远楼', 'A0213']);
		expect(locationDisplayLines('两江校区 弘远楼A0213', { includeCampus: false })).toEqual([
			'弘远楼',
			'A0213'
		]);
	});
});

describe('placeCapsules', () => {
	const visibleDays = [{ dayOfWeek: 1 }, { dayOfWeek: 2 }, { dayOfWeek: 3 }];

	it('places a single course with full-column geometry', () => {
		const items = placeCapsules({
			courseDisplayModels: [courseModel('a', 1, 2, 3, { location: '两江校区 弘远楼A0213' })],
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: false
		});

		expect(items).toHaveLength(1);
		const item = items[0]!;
		expect(item.kind).toBe('course');
		if (item.kind !== 'course') return;
		expect(item.geometry).toEqual({
			leftPercent: 0,
			widthPercent: 100 / 3,
			startPeriod: 2,
			endPeriod: 3
		});
		expect(item.locationLines).toEqual(['两江校区', '弘远楼', 'A0213']);
		expect(item.scale.titlePx).toBe(17);
		expect(item.badgeLabel).toBeNull();
		expect(item.colors.background).toBe('#EADDFF');
	});

	it('remaps default palette colors when a custom course palette is passed', () => {
		const off = placeCapsules({
			courseDisplayModels: [courseModel('a', 1, 1, 1)],
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: false
		});
		const on = placeCapsules({
			courseDisplayModels: [courseModel('a', 1, 1, 1)],
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: false,
			coursePalette: EASTER_EGG_PALETTE_ENTRIES
		});
		expect(off[0]?.kind).toBe('course');
		expect(on[0]?.kind).toBe('course');
		if (off[0]?.kind !== 'course' || on[0]?.kind !== 'course') return;
		expect(off[0].colors.background).toBe('#EADDFF');
		expect(on[0].colors.background).toBe('#FFEE55');
		expect(on[0].colors.text).toBe('#1a1a1a');
	});

	it('spreads colliding default-palette courses across all capsule colors', () => {
		const models = [
			courseModel('a', 1, 1, 1),
			courseModel('b', 1, 3, 3),
			courseModel('c', 2, 1, 1),
			courseModel('d', 2, 3, 3),
			courseModel('e', 3, 1, 1),
			courseModel('f', 3, 3, 3)
		];
		const items = placeCapsules({
			courseDisplayModels: models,
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: false
		});
		const backgrounds = items
			.filter((item) => item.kind === 'course')
			.map((item) => (item.kind === 'course' ? item.colors.background : ''));
		expect(backgrounds).toHaveLength(6);
		expect(new Set(backgrounds)).toEqual(
			new Set(['#EADDFF', '#FFDBC9', '#C4EED0', '#D3E3FD', '#FFD8E4', '#F6E1B0'])
		);
	});

	it('spreads unique courses across all easter-egg colors', () => {
		const models = [
			courseModel('a', 1, 1, 1),
			courseModel('b', 1, 3, 3),
			courseModel('c', 2, 1, 1),
			courseModel('d', 2, 3, 3),
			courseModel('e', 3, 1, 1),
			courseModel('f', 3, 3, 3)
		];
		const items = placeCapsules({
			courseDisplayModels: models,
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: false,
			coursePalette: EASTER_EGG_PALETTE_ENTRIES
		});
		const backgrounds = items
			.filter((item) => item.kind === 'course')
			.map((item) => (item.kind === 'course' ? item.colors.background : ''));
		expect(backgrounds).toHaveLength(6);
		expect(new Set(backgrounds)).toEqual(
			new Set(['#FFEE55', '#FFBBCC', '#4477CC', '#9977CC', '#EE5577', '#4D5B4C'])
		);
	});

	it('keeps a course color stable when the visible week is a subset', () => {
		const all = [
			courseModel('a', 1, 1, 1),
			courseModel('b', 1, 3, 3),
			courseModel('c', 2, 1, 1),
			courseModel('d', 2, 3, 3),
			courseModel('e', 3, 1, 1)
		];
		const paletteCourses = all.map((model) => model.course);
		const full = placeCapsules({
			courseDisplayModels: all,
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: false,
			coursePalette: EASTER_EGG_PALETTE_ENTRIES,
			paletteCourses
		});
		const week = placeCapsules({
			courseDisplayModels: [courseModel('e', 3, 1, 1)],
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: false,
			coursePalette: EASTER_EGG_PALETTE_ENTRIES,
			paletteCourses
		});
		const fromFull = full.find((item) => item.kind === 'course' && item.course.name === 'e');
		expect(fromFull?.kind).toBe('course');
		expect(week[0]?.kind).toBe('course');
		if (fromFull?.kind !== 'course' || week[0]?.kind !== 'course') return;
		expect(week[0].colors.background).toBe(fromFull.colors.background);
	});

	it('leaves custom course colors unchanged when a custom course palette is passed', () => {
		const [item] = placeCapsules({
			courseDisplayModels: [courseModel('a', 1, 1, 1, { color: '#123456' })],
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: false,
			coursePalette: EASTER_EGG_PALETTE_ENTRIES
		});
		expect(item?.kind).toBe('course');
		if (item?.kind !== 'course') return;
		expect(item.colors.background).toBe('#123456');
	});

	it('emits an overlap placeholder until the slot is expanded', () => {
		const models = [courseModel('a', 1, 1, 2), courseModel('b', 1, 2, 3)];
		const key = periodSlotKey(1, 1, 3);

		const collapsed = placeCapsules({
			courseDisplayModels: models,
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: false
		});
		expect(collapsed).toHaveLength(1);
		expect(collapsed[0]).toMatchObject({
			kind: 'overlap-placeholder',
			key,
			count: 2
		});

		const expanded = placeCapsules({
			courseDisplayModels: models,
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set([key]),
			isDark: false
		});
		expect(expanded).toHaveLength(2);
		expect(expanded.every((item) => item.kind === 'course')).toBe(true);
		if (expanded[0]?.kind !== 'course' || expanded[1]?.kind !== 'course') return;
		expect(expanded[0].geometry.widthPercent).toBeCloseTo(100 / 3 / 2);
		expect(expanded[1].geometry.leftPercent).toBeCloseTo(expanded[0].geometry.widthPercent);
		expect(expanded[0].overlapCount).toBe(2);
	});

	it('blends course colors in dark mode', () => {
		const [item] = placeCapsules({
			courseDisplayModels: [courseModel('a', 1, 1, 1)],
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: true
		});
		expect(item?.kind).toBe('course');
		if (item?.kind !== 'course') return;
		expect(item.colors.background).not.toBe('#EADDFF');
		expect(item.colors.background.startsWith('#')).toBe(true);
	});

	it('hides campus lines when the column is narrow', () => {
		const [item] = placeCapsules({
			courseDisplayModels: [courseModel('a', 1, 1, 1, { location: '两江校区 弘远楼A0213' })],
			visibleDays,
			columnWidthPx: 69,
			expandedSlotKeys: new Set(),
			isDark: false
		});
		expect(item?.kind).toBe('course');
		if (item?.kind !== 'course') return;
		expect(item.locationLines).toEqual(['弘远楼', 'A0213']);
	});

	it('sets badgeLabel when the course is outside the displayed week', () => {
		const [item] = placeCapsules({
			courseDisplayModels: [courseModel('a', 1, 1, 1, { isInDisplayedWeek: false })],
			visibleDays,
			columnWidthPx: 110,
			expandedSlotKeys: new Set(),
			isDark: false
		});
		expect(item?.kind).toBe('course');
		if (item?.kind !== 'course') return;
		expect(item.badgeLabel).toBe('非本周');
	});
});

function courseModel(
	id: string,
	dayOfWeek: number,
	startPeriod: number,
	endPeriod: number,
	options?: { location?: string; isInDisplayedWeek?: boolean; color?: string }
) {
	return {
		course: {
			id,
			name: id,
			teacher: '老师',
			location: options?.location ?? 'A101',
			dayOfWeek,
			startPeriod,
			endPeriod,
			color: options?.color ?? '#EADDFF',
			textColor: '#21005D',
			weeks: [1],
			remark: ''
		},
		isInDisplayedWeek: options?.isInDisplayedWeek ?? true
	};
}
