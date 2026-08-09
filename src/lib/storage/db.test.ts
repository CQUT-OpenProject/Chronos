import { describe, expect, it } from 'vite-plus/test';
import { ChronosDB } from './db';

describe('ChronosDB schema', () => {
	it('defines version 2 with timetables, courses, and wallpapers stores', () => {
		const db = new ChronosDB();
		expect(db.verno).toBe(2);
		expect(db.tables.map((table) => table.name).sort()).toEqual([
			'courses',
			'timetables',
			'wallpapers'
		]);
	});
});
