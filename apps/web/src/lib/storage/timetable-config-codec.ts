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

const SCHEMA_VERSION = 1;

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
		const importMetadata = slimImportMetadata(
			timetableImportMetadataSchema.parse(parsed.importMetadata)
		);
		return {
			schemaVersion: parsed.schemaVersion,
			academicConfig: academicConfigSchema.parse(parsed.academicConfig),
			importMetadata,
			viewPrefs: timetableViewPrefsSchema.parse(parsed.viewPrefs),
			customMetadata: parsed.customMetadata
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
