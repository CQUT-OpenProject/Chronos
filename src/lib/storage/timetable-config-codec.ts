import {
	academicConfigSchema,
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
	viewPrefs: TimetableViewPrefs
): string {
	const config: TimetableConfig = {
		schemaVersion: SCHEMA_VERSION,
		academicConfig,
		importMetadata,
		viewPrefs
	};
	return JSON.stringify(config);
}

export function decodeTimetableConfig(configJson: string, timetableId?: string): TimetableConfig {
	try {
		const parsed = timetableConfigSchema.parse(JSON.parse(configJson));
		return {
			schemaVersion: parsed.schemaVersion,
			academicConfig: academicConfigSchema.parse(parsed.academicConfig),
			importMetadata: timetableImportMetadataSchema.parse(parsed.importMetadata),
			viewPrefs: timetableViewPrefsSchema.parse(parsed.viewPrefs)
		};
	} catch (error) {
		if (timetableId) {
			console.warn(
				`Failed to decode timetable config (id=${timetableId}, schema=${SCHEMA_VERSION})`,
				error
			);
		}
		return timetableConfigSchema.parse({});
	}
}
