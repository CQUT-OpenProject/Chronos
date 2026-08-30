import { describe, it, expect } from 'vite-plus/test';
import {
	COURSE_PALETTE_ENTRIES,
	kotlinStringHashCode,
	normalizedCourseName,
	coursePalette,
	resolveCoursePaint,
	assignCourseDisplayColors
} from '../src/index';

describe('Palette Algorithm in @chronos/core', () => {
	it('computes Kotlin-compatible string hash code', () => {
		expect(kotlinStringHashCode('高等数学')).toBeTypeOf('number');
		expect(kotlinStringHashCode('高等数学')).toBe(kotlinStringHashCode('高等数学'));
	});

	it('normalizes course name by removing prefixes and markers', () => {
		expect(normalizedCourseName('【调】大学英语★')).toBe('大学英语');
		expect(normalizedCourseName(' 软件工程   原理 ')).toBe('软件工程 原理');
	});

	it('derives stable course palette by name', () => {
		const [bg1, fg1] = coursePalette('高等数学');
		const [bg2, fg2] = coursePalette('高等数学');
		expect(bg1).toBe(bg2);
		expect(fg1).toBe(fg2);
	});

	it('resolves course paint from name and display palette', () => {
		const paint = resolveCoursePaint({ name: '高等数学' });
		const [bg] = coursePalette('高等数学');
		const slot = COURSE_PALETTE_ENTRIES.findIndex((entry) => entry.background === bg);
		expect(paint.background).toBe(COURSE_PALETTE_ENTRIES[slot]?.background);
		expect(paint.foreground).toBe(COURSE_PALETTE_ENTRIES[slot]?.foreground);
	});

	it('assigns course display colors across palette evenly', () => {
		const courses = [{ name: '高等数学' }, { name: '线性代数' }, { name: '大学物理' }];

		const assigned = assignCourseDisplayColors(courses);
		expect(assigned.size).toBe(3);
		expect(assigned.get('高等数学')).toBeDefined();
		expect(assigned.get('线性代数')).toBeDefined();
		expect(assigned.get('大学物理')).toBeDefined();
	});

	it('assigns distinct display colors when enough courses are present', () => {
		const courses = [{ name: '高等数学' }, { name: '线性代数' }, { name: '大学物理' }];

		const assigned = assignCourseDisplayColors(courses);
		const backgrounds = new Set([...assigned.values()].map((entry) => entry.background));
		expect(backgrounds.size).toBe(3);
	});
});
