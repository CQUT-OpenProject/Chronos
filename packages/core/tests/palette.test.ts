import { describe, it, expect } from 'vite-plus/test';
import {
	COURSE_PALETTE_ENTRIES,
	kotlinStringHashCode,
	normalizedCourseName,
	coursePalette,
	resolveCoursePaint,
	assignCourseDisplayColors,
	defaultPaletteSlot
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

	it('identifies default palette slot from color hex', () => {
		const firstBg = COURSE_PALETTE_ENTRIES[0]?.background ?? '';
		expect(defaultPaletteSlot(firstBg)).toBe(0);
		expect(defaultPaletteSlot('#000000')).toBeNull();
	});

	it('resolves course paint with custom or palette fallback', () => {
		const defaultPaint = resolveCoursePaint({ color: COURSE_PALETTE_ENTRIES[1]?.background });
		expect(defaultPaint.background).toBe(COURSE_PALETTE_ENTRIES[1]?.background);
		expect(defaultPaint.foreground).toBe(COURSE_PALETTE_ENTRIES[1]?.foreground);

		const customPaint = resolveCoursePaint({ color: '#123456', textColor: '#FFFFFF' });
		expect(customPaint.background).toBe('#123456');
		expect(customPaint.foreground).toBe('#FFFFFF');
	});

	it('assigns course display colors across palette evenly', () => {
		const courses = [
			{ name: '高等数学', color: COURSE_PALETTE_ENTRIES[0]?.background },
			{ name: '线性代数', color: COURSE_PALETTE_ENTRIES[0]?.background },
			{ name: '大学物理', color: COURSE_PALETTE_ENTRIES[1]?.background }
		];

		const assigned = assignCourseDisplayColors(courses);
		expect(assigned.size).toBe(3);
		expect(assigned.get('高等数学')).toBeDefined();
		expect(assigned.get('线性代数')).toBeDefined();
		expect(assigned.get('大学物理')).toBeDefined();
	});

	it('assigns course display colors across palette when color is omitted', () => {
		const courses = [{ name: '高等数学' }, { name: '线性代数' }, { name: '大学物理' }];

		const assigned = assignCourseDisplayColors(courses);
		expect(assigned.size).toBe(3);
		expect(assigned.get('高等数学')).toBeDefined();
		expect(assigned.get('线性代数')).toBeDefined();
		expect(assigned.get('大学物理')).toBeDefined();
		// Ensure different courses receive different palette entries
		const backgrounds = new Set([...assigned.values()].map((e) => e.background));
		expect(backgrounds.size).toBe(3);
	});
});
