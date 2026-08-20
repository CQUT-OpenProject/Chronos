import {
	academicConfigSchema,
	slimImportMetadata,
	timetableConfigSchema,
	timetableImportMetadataSchema,
	timetableViewPrefsSchema,
	type AcademicConfig,
	type TimetableConfig,
	type TimetableImportMetadata,
	type TimetableViewPrefs
} from '$lib/models/timetable';

export const SCHEMA_VERSION = 1;

export function encodeTimetableConfig(
	academicConfig: AcademicConfig,
	importMetadata: TimetableImportMetadata,
	viewPrefs: TimetableViewPrefs,
	customMetadata?: Record<string, unknown>
): string {
	const config = {
		schemaVersion: SCHEMA_VERSION,
		academicConfig,
		importMetadata,
		viewPrefs,
		...(customMetadata ? { customMetadata } : {})
	};
	return JSON.stringify(config);
}

export function decodeTimetableConfig(configJson: string, timetableId?: string): TimetableConfig {
	try {
		const parsed = timetableConfigSchema.parse(JSON.parse(configJson));
		const storedMeta = timetableImportMetadataSchema.parse(parsed.importMetadata);
		const importMetadata = slimImportMetadata(storedMeta);
		const migratedCqut =
			storedMeta.campusPeriodTimes && !parsed.customMetadata?.['source-cqut']
				? {
						'source-cqut': {
							campusId: importMetadata.campusId,
							campusPeriodTimes: storedMeta.campusPeriodTimes
						}
					}
				: undefined;
		return {
			schemaVersion: parsed.schemaVersion,
			academicConfig: academicConfigSchema.parse(parsed.academicConfig),
			importMetadata,
			viewPrefs: timetableViewPrefsSchema.parse(parsed.viewPrefs),
			customMetadata: migratedCqut
				? { ...parsed.customMetadata, ...migratedCqut }
				: parsed.customMetadata
		};
	} catch (error) {
		if (timetableId) {
			console.warn(
				`Failed to decode timetable config (id=${timetableId}, schema=${SCHEMA_VERSION})`,
				error
			);
		}
		const fallback = timetableConfigSchema.parse({});
		return {
			schemaVersion: fallback.schemaVersion,
			academicConfig: fallback.academicConfig,
			importMetadata: slimImportMetadata(fallback.importMetadata),
			viewPrefs: fallback.viewPrefs,
			customMetadata: fallback.customMetadata
		};
	}
}
