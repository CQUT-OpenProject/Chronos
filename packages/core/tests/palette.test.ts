import { describe, it, expect } from 'vite-plus/test';
import { normalizedCourseName, coursePalette, assignCourseDisplayColors } from '../src/index';

describe('Palette Algorithm in @chronos/core', () => {
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

	it('assigns course display colors across palette evenly', () => {
		const courses = [{ name: '高等数学' }, { name: '线性代数' }, { name: '大学物理' }];

		const assigned = assignCourseDisplayColors(courses);
		expect(assigned.size).toBe(3);
	});

	it('assigns distinct display colors when enough courses are present', () => {
		const courses = [{ name: '高等数学' }, { name: '线性代数' }, { name: '大学物理' }];

		const assigned = assignCourseDisplayColors(courses);
		const backgrounds = new Set([...assigned.values()].map((entry) => entry.background));
		expect(backgrounds.size).toBe(3);
	});
});
