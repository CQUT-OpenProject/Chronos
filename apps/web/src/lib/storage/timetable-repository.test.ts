import { describe, expect, it, vi } from 'vite-plus/test';
import { createCourse, createTimetable } from '@chronos/core';
import type { ChronosDB, CourseRow, TimetableRow } from '$lib/storage/db';
import { TimetableRepository } from './timetable-repository';

function createMockDb(): ChronosDB {
	const timetablesMap = new Map<string, TimetableRow>();
	const coursesMap = new Map<string, CourseRow>();

	return {
		timetables: {
			get: vi.fn(async (id: string) => timetablesMap.get(id) ?? undefined),
			put: vi.fn(async (row: TimetableRow) => {
				timetablesMap.set(row.id, row);
				return row.id;
			}),
			delete: vi.fn(async (id: string) => {
				timetablesMap.delete(id);
			}),
			orderBy: vi.fn(() => ({
				reverse: () => ({
					toArray: async () =>
						Array.from(timetablesMap.values()).sort((a, b) => b.updatedAt - a.updatedAt)
				})
			})),
			toArray: async () => Array.from(timetablesMap.values()),
			clear: vi.fn(async () => timetablesMap.clear())
		},
		courses: {
			where: vi.fn(() => ({
				equals: (val: unknown) => ({
					toArray: async () => Array.from(coursesMap.values()).filter((c) => c.timetableId === val),
					primaryKeys: async () =>
						Array.from(coursesMap.values())
							.filter((c) => c.timetableId === val)
							.map((c) => c.id),
					delete: vi.fn(async () => {})
				}),
				anyOf: vi.fn(() => ({ toArray: async () => [] }))
			})),
			toArray: async () => Array.from(coursesMap.values()),
			bulkPut: vi.fn(async (rows: CourseRow[]) => {
				for (const row of rows) coursesMap.set(row.id, row);
			}),
			bulkDelete: vi.fn(async () => {}),
			clear: vi.fn(async () => coursesMap.clear())
		},
		transaction: vi.fn(async (_mode: string, ...args: unknown[]) => {
			const fn = args[args.length - 1] as () => Promise<void>;
			return fn();
		})
	} as unknown as ChronosDB;
}

describe('TimetableRepository', () => {
	it('returns null when getTimetable read fails', async () => {
		const database = createMockDb();
		vi.mocked(database.timetables.get).mockRejectedValueOnce(new Error('idb unavailable'));
		const repo = new TimetableRepository(database);

		await expect(repo.getTimetable('missing')).resolves.toBeNull();
	});

	it('returns empty list when listTimetables read fails', async () => {
		const database = createMockDb();
		vi.mocked(database.timetables.orderBy).mockImplementationOnce(() => {
			throw new Error('idb unavailable');
		});
		const repo = new TimetableRepository(database);

		await expect(repo.listTimetables()).resolves.toEqual([]);
	});

	it('propagates saveTimetable write failures', async () => {
		const database = createMockDb();
		vi.mocked(database.transaction).mockRejectedValueOnce(new Error('write failed'));
		const repo = new TimetableRepository(database);
		const timetable = createTimetable({
			id: 'tt-1',
			name: 'Main',
			courses: [
				createCourse({ id: 'c-1', name: 'Math', dayOfWeek: 1, startPeriod: 1, endPeriod: 1 })
			]
		});

		await expect(repo.saveTimetable(timetable)).rejects.toThrow('write failed');
	});
});
