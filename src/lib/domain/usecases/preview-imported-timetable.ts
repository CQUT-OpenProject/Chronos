import type { Timetable } from '$lib/models/timetable';
import type { EducationalTimetableHtmlParser } from '../interfaces/educational-timetable-html-parser';
import type { TimetableShareLinkCodec } from '../interfaces/timetable-share-link-codec';
import { AppError } from '../result/app-error';
import { failure, flatMapSync, success, type AppResult } from '../result/app-result';

export class PreviewImportedTimetableUseCase {
	constructor(
		private readonly educationalTimetableHtmlParser: EducationalTimetableHtmlParser,
		private readonly shareLinkCodec: TimetableShareLinkCodec
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

	async invoke(content: string): Promise<AppResult<Timetable>> {
		const shareResult = await this.shareLinkCodec.decodeFromText(content);
		if (shareResult !== null) return shareResult;

		return flatMapSync(this.educationalTimetableHtmlParser.parse(content), (timetable) => {
			if (timetable) return success(timetable);
			return failure(AppError.validation('无法识别分享内容，请检查剪贴板中的课表链接'));
		});
	}
}
