import { describe, expect, it } from 'vite-plus/test';
import { courseFromRow, courseToRow } from './mappers';

describe('storage mappers', () => {
	it('round-trips course weeks through weeksCsv', () => {
		const course = {
			id: 'c1',
			name: '编译原理',
			teacher: '张老师',
			location: 'B201',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1, 3, 5],
			remark: 'note'
		};

		const row = courseToRow(course, 't1');
		expect(row.weeksCsv).toBe('1,3,5');

		const restored = courseFromRow(row);
		expect(restored.weeks).toEqual([1, 3, 5]);
		expect(restored.remark).toBe('note');
	});
});
