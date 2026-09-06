import type { CourseQueryFilter, CourseQueryHit, Timetable } from '@chronos/core';
import { countDistinctCourseNames, matchesCourseQuery } from '@chronos/core';
import type { ChronosDB } from '$lib/storage/db';
import { courseFromRow, courseToRow, timetableFromRow, timetableToRow } from '$lib/storage/mappers';

/** Dexie-backed timetable and course persistence. */
export class TimetableRepository {
	constructor(private database: ChronosDB) {}

	async getTimetable(id: string): Promise<Timetable | null> {
		try {
			const row = await this.database.timetables.get(id);
			if (!row) return null;
			const courses = await this.database.courses.where('timetableId').equals(id).toArray();
			return timetableFromRow(row, courses);
		} catch {
			return null;
		}
	}

	async listTimetables(): Promise<
		Array<{ id: string; name: string; courseCount: number; updatedAt: number }>
	> {
		try {
			const rows = await this.database.timetables.orderBy('updatedAt').reverse().toArray();
			const results = await Promise.all(
				rows.map(async (r) => {
					const courseRows = await this.database.courses
						.where('timetableId')
						.equals(r.id)
						.toArray();
					const count = countDistinctCourseNames(courseRows.map(courseFromRow));
					return { id: r.id, name: r.name, courseCount: count, updatedAt: r.updatedAt };
				})
			);
			return results;
		} catch {
			return [];
		}
	}

	async queryCourses(filter: CourseQueryFilter = {}): Promise<CourseQueryHit[]> {
		try {
			const timetableRows = await this.database.timetables.toArray();
			const timetableNameById = new Map(timetableRows.map((row) => [row.id, row.name]));
			const allowedTimetableIds =
				filter.timetableIds !== undefined
					? new Set(filter.timetableIds)
					: new Set(timetableRows.map((row) => row.id));

			let courseRows;
			const ids = filter.timetableIds;
			if (ids?.length === 1) {
				courseRows = await this.database.courses.where('timetableId').equals(ids[0]!).toArray();
			} else if (ids && ids.length > 1) {
				courseRows = await this.database.courses.where('timetableId').anyOf(ids).toArray();
			} else {
				courseRows = await this.database.courses.toArray();
			}

			const hits: CourseQueryHit[] = [];
			for (const row of courseRows) {
				if (!allowedTimetableIds.has(row.timetableId)) continue;
				const course = courseFromRow(row);
				if (!matchesCourseQuery(course, filter)) continue;
				hits.push({
					timetableId: row.timetableId,
					timetableName: timetableNameById.get(row.timetableId) ?? '',
					course
				});
			}
			return hits;
		} catch {
			return [];
		}
	}

	async saveTimetable(timetable: Timetable): Promise<void> {
		const row = timetableToRow(timetable);
		const courseRows = timetable.courses.map((course) => courseToRow(course, timetable.id));

		await this.database.transaction(
			'rw',
			this.database.timetables,
			this.database.courses,
			async () => {
				await this.database.timetables.put(row);

				const persistedIds = new Set(
					await this.database.courses.where('timetableId').equals(timetable.id).primaryKeys()
				);
				const incomingIds = new Set(courseRows.map((course) => course.id));
				const removedIds = [...persistedIds].filter((id) => !incomingIds.has(String(id)));

				if (removedIds.length > 0) {
					await this.database.courses.bulkDelete(removedIds);
				}
				if (courseRows.length > 0) {
					await this.database.courses.bulkPut(courseRows);
				}
			}
		);
	}

	async deleteTimetable(id: string): Promise<void> {
		await this.database.transaction(
			'rw',
			this.database.timetables,
			this.database.courses,
			async () => {
				await this.database.courses.where('timetableId').equals(id).delete();
				await this.database.timetables.delete(id);
			}
		);
	}

	async clearTimetables(): Promise<void> {
		await this.database.transaction(
			'rw',
			this.database.timetables,
			this.database.courses,
			async () => {
				await this.database.timetables.clear();
				await this.database.courses.clear();
			}
		);
	}

	async estimateBytes(): Promise<number> {
		try {
			const [timetables, courses] = await Promise.all([
				this.database.timetables.toArray(),
				this.database.courses.toArray()
			]);

			const encoder = new TextEncoder();
			let total = 0;
			for (const row of timetables) {
				total += encoder.encode(JSON.stringify(row)).length;
			}
			for (const row of courses) {
				total += encoder.encode(JSON.stringify(row)).length;
			}
			return total;
		} catch {
			return 0;
		}
	}
}
