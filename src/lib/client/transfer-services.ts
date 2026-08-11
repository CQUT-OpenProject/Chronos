import { getPreferencesRepository, getRepository } from './repository';
import { ApiRemoteTimetableSource } from './api-remote-timetable-source';
import { DefaultTimetableShareCodec } from '$lib/parsers/shared-json/default-timetable-share-codec';
import { ChronosTimetableShareLinkCodec } from '$lib/parsers/share-link/chronos-timetable-share-link-codec';
import { EducationalTimetableHtmlParser } from '$lib/parsers/edu-html/educational-timetable-html-parser';
import { PreviewImportedTimetableUseCase } from '$lib/domain/usecases/preview-imported-timetable';
import { PreviewOnlineTimetableUseCase } from '$lib/domain/usecases/preview-online-timetable';
import { ImportTimetableUseCase } from '$lib/domain/usecases/import-timetable';
import { ExportCurrentTimetableUseCase } from '$lib/domain/usecases/export-current-timetable';
import type { PreferencesRepository } from '$lib/domain/interfaces/preferences-repository';
import type { TimetableRepository } from '$lib/domain/interfaces/timetable-repository';

export function createTransferServices(
	repository: TimetableRepository = getRepository(),
	preferences: PreferencesRepository = getPreferencesRepository()
) {
	// Dual codec seam wiring (see interface JSDoc on each codec):
	// previewImported → shareLinkCodec (+ htmlParser fallback)
	// previewOnline   → onlineCodec
	// exportCurrent   → shareLinkCodec only
	const onlineCodec = new DefaultTimetableShareCodec();
	const shareLinkCodec = new ChronosTimetableShareLinkCodec();
	const htmlParser = new EducationalTimetableHtmlParser();
	const remoteSource = new ApiRemoteTimetableSource();

	return {
		previewImported: new PreviewImportedTimetableUseCase(htmlParser, shareLinkCodec),
		previewOnline: new PreviewOnlineTimetableUseCase(remoteSource, onlineCodec),
		importTimetable: new ImportTimetableUseCase(repository, preferences),
		exportCurrent: new ExportCurrentTimetableUseCase(repository, shareLinkCodec)
	};
}

export type TransferServices = ReturnType<typeof createTransferServices>;
