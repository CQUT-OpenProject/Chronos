import type { Timetable } from '$lib/models/timetable';
import type { EducationalTimetableHtmlParser } from '../interfaces/educational-timetable-html-parser';
import type { TimetableShareCodec } from '../interfaces/timetable-share-codec';
import { AppError } from '../result/app-error';
import { failure, flatMapSync, success, type AppResult } from '../result/app-result';

export class PreviewImportedTimetableUseCase {
	constructor(
		private readonly educationalTimetableHtmlParser: EducationalTimetableHtmlParser,
		private readonly timetableShareCodec: TimetableShareCodec
	) {}

	previewHtml(contentBytes: Uint8Array): AppResult<Timetable> {
		return flatMapSync(
			this.educationalTimetableHtmlParser.parseBytes(contentBytes),
			(timetable) => {
				if (timetable) return success(timetable);
				return failure(AppError.validation('导入失败，未识别到可用的教务课表 HTML 内容'));
			}
		);
	}

	invoke(content: string): AppResult<Timetable> {
		return flatMapSync(this.educationalTimetableHtmlParser.parse(content), (timetable) => {
			if (timetable) return success(timetable);
			return flatMapSync(this.timetableShareCodec.decode(content), (payload) =>
				this.timetableShareCodec.toTimetable(payload)
			);
		});
	}
}
