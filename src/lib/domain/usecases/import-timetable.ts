import type { Timetable } from '$lib/models/timetable';
import { ImportMode } from '../import-mode';
import type { EducationalTimetableHtmlParser } from '../interfaces/educational-timetable-html-parser';
import type { TimetableRepository } from '../interfaces/timetable-repository';
import type { TimetableShareCodec } from '../interfaces/timetable-share-codec';
import { AppError } from '../result/app-error';
import { failure, flatMapSync, success, type AppResult } from '../result/app-result';

export interface ImportTimetableResult {
	timetableId: string;
	mode: ImportMode;
}

export class ImportTimetableUseCase {
	constructor(
		private readonly repository: TimetableRepository,
		private readonly educationalTimetableHtmlParser: EducationalTimetableHtmlParser,
		private readonly timetableShareCodec: TimetableShareCodec
	) {}

	async invoke(content: string, mode: ImportMode): Promise<AppResult<ImportTimetableResult>> {
		const parsed = flatMapSync(this.educationalTimetableHtmlParser.parse(content), (imported) => {
			if (imported) return success(imported);
			return flatMapSync(this.timetableShareCodec.decode(content), (payload) =>
				this.timetableShareCodec.toTimetable(payload)
			);
		});

		if (!parsed.ok) return parsed;
		return this.import(parsed.value, mode);
	}

	async import(imported: Timetable, mode: ImportMode): Promise<AppResult<ImportTimetableResult>> {
		if (mode === ImportMode.AS_NEW) {
			const now = Date.now();
			const newTimetableId = crypto.randomUUID();
			const newTimetable: Timetable = {
				...imported,
				id: newTimetableId,
				createdAt: now,
				updatedAt: now,
				courses: assignCourseIds(imported, newTimetableId)
			};
			await this.repository.saveTimetable(newTimetable);
			await this.repository.setCurrentTimetableId(newTimetable.id);
			return success({ timetableId: newTimetable.id, mode });
		}

		const currentTimetable = (await this.repository.getAppStateSnapshot()).currentTimetable;
		if (!currentTimetable) {
			return failure(AppError.notFound('当前没有可覆盖的课程表'));
		}

		const overwritten: Timetable = {
			...imported,
			id: currentTimetable.id,
			name: currentTimetable.name,
			createdAt: currentTimetable.createdAt,
			updatedAt: Date.now(),
			courses: assignCourseIds(imported, currentTimetable.id),
			viewPrefs: currentTimetable.viewPrefs
		};
		await this.repository.saveTimetable(overwritten);
		return success({ timetableId: overwritten.id, mode });
	}
}

function assignCourseIds(imported: Timetable, timetableId: string) {
	return imported.courses.map((course, index) => ({
		...course,
		id: `${timetableId}:${index + 1}`
	}));
}
