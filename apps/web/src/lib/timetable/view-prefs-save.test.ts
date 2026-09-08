import { describe, expect, it } from 'vite-plus/test';
import type { TimetableViewPrefs } from '@chronos/core';
import { createViewPrefsSaver } from './view-prefs-save';

const base: TimetableViewPrefs = {
	showSaturday: true,
	showSunday: true,
	showNonCurrentWeekCourses: false
};

describe('createViewPrefsSaver', () => {
	it('does not let an in-flight save overwrite a later toggle', async () => {
		let release!: () => void;
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		const saved: TimetableViewPrefs[] = [];
		let calls = 0;

		const saver = createViewPrefsSaver(async (prefs) => {
			calls += 1;
			if (calls === 1) await gate;
			saved.push({ ...prefs });
		});

		saver.apply(base, { showSaturday: false });
		saver.apply(base, { showSunday: false });
		release();
		await saver.whenIdle();

		expect(saved.at(-1)).toEqual({
			showSaturday: false,
			showSunday: false,
			showNonCurrentWeekCourses: false
		});
	});
});
