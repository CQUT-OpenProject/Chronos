import type { Course } from '$lib/models/course';
import type { Timetable } from '$lib/models/timetable';
import type { TimetableSummary } from '$lib/models/app-state';
import { db } from './db';
import { courseToRow, summaryFromRow, timetableFromRow, timetableToRow } from './mappers';

export async function getTimetableSummaries(): Promise<TimetableSummary[]> {
	const [rows, allCourses] = await Promise.all([
		db.timetables.orderBy('updatedAt').reverse().toArray(),
		db.courses.toArray()
	]);

	const countByTimetableId = new Map<string, number>();
	for (const course of allCourses) {
		countByTimetableId.set(
			course.timetableId,
			(countByTimetableId.get(course.timetableId) ?? 0) + 1
		);
	}

	return rows.map((row) => summaryFromRow(row, countByTimetableId.get(row.id) ?? 0));
}

export async function getTimetable(id: string): Promise<Timetable | null> {
	const row = await db.timetables.get(id);
	if (!row) return null;
	const courses = await db.courses.where('timetableId').equals(id).toArray();
	return timetableFromRow(row, courses);
}

export async function saveTimetable(timetable: Timetable): Promise<void> {
	await upsertTimetableGraph(timetable);
}

export async function saveCourse(timetableId: string, course: Course): Promise<void> {
	const updatedAt = Date.now();
	const updated = await db.timetables.update(timetableId, { updatedAt });
	if (updated === 0) return;
	await db.courses.put(courseToRow(course, timetableId));
}

export async function deleteCourse(courseId: string): Promise<void> {
	const row = await db.courses.get(courseId);
	if (!row) return;
	await db.courses.delete(courseId);
	await db.timetables.update(row.timetableId, { updatedAt: Date.now() });
}

export async function deleteTimetable(id: string): Promise<void> {
	await db.transaction('rw', db.timetables, db.courses, async () => {
		await db.courses.where('timetableId').equals(id).delete();
		await db.timetables.delete(id);
	});
}

async function upsertTimetableGraph(timetable: Timetable): Promise<void> {
	const row = timetableToRow(timetable);
	const courseRows = timetable.courses.map((course) => courseToRow(course, timetable.id));

	await db.transaction('rw', db.timetables, db.courses, async () => {
		await db.timetables.put(row);

		const persistedIds = new Set(
			await db.courses.where('timetableId').equals(timetable.id).primaryKeys()
		);
		const incomingIds = new Set(courseRows.map((course) => course.id));
		const removedIds = [...persistedIds].filter((id) => !incomingIds.has(String(id)));

		if (removedIds.length > 0) {
			await db.courses.bulkDelete(removedIds);
		}
		if (courseRows.length > 0) {
			await db.courses.bulkPut(courseRows);
		}
	});
}
