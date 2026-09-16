import { describe, expect, it } from 'vitest';
import {
	COURSE_CAPSULE_PAD_X_PX,
	courseCapsuleInnerWidthPx
} from '../src/utils/fit-width-font.svelte';

describe('courseCapsuleInnerWidthPx', () => {
	it('matches full-column capsule width for multi-day grids', () => {
		const gridBodyWidth = 700;
		const visibleDayCount = 7;
		const columnWidthPx = gridBodyWidth / visibleDayCount;
		const widthPercent = 100 / visibleDayCount;

		expect(courseCapsuleInnerWidthPx(columnWidthPx, widthPercent, visibleDayCount)).toBe(
			gridBodyWidth / visibleDayCount - COURSE_CAPSULE_PAD_X_PX * 2
		);
	});

	it('scales down for overlapping capsules in the same column', () => {
		const gridBodyWidth = 700;
		const visibleDayCount = 7;
		const overlapCount = 2;
		const columnWidthPx = gridBodyWidth / visibleDayCount;
		const widthPercent = 100 / visibleDayCount / overlapCount;

		expect(courseCapsuleInnerWidthPx(columnWidthPx, widthPercent, visibleDayCount)).toBe(
			gridBodyWidth / visibleDayCount / overlapCount - COURSE_CAPSULE_PAD_X_PX * 2
		);
	});
});
