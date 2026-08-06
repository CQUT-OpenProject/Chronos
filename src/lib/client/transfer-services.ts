import { getRepository } from './repository';
import { DefaultTimetableShareCodec } from '$lib/parsers/shared-json/default-timetable-share-codec';
import { EducationalTimetableHtmlParser } from '$lib/parsers/edu-html/educational-timetable-html-parser';
import { PreviewImportedTimetableUseCase } from '$lib/domain/usecases/preview-imported-timetable';
import { ImportTimetableUseCase } from '$lib/domain/usecases/import-timetable';
import { ExportCurrentTimetableUseCase } from '$lib/domain/usecases/export-current-timetable';
import type { TimetableRepository } from '$lib/domain/interfaces/timetable-repository';

export function createTransferServices(repository: TimetableRepository = getRepository()) {
	const codec = new DefaultTimetableShareCodec();
	const htmlParser = new EducationalTimetableHtmlParser();

	return {
		previewImported: new PreviewImportedTimetableUseCase(htmlParser, codec),
		importTimetable: new ImportTimetableUseCase(repository, htmlParser, codec),
		exportCurrent: new ExportCurrentTimetableUseCase(repository, codec)
	};
}

export type TransferServices = ReturnType<typeof createTransferServices>;
