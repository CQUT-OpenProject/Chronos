import type { Timetable } from '$lib/models/timetable';
import { ImportMode } from '$lib/domain/import-mode';

export type TransferImportSource = 'ONLINE' | 'SHARE_LINK' | 'HTML';

const PREVIEW_KEY = 'chronos:import-preview';
const PREVIEW_SOURCE_KEY = 'chronos:import-preview-source';
const IMPORT_MODE_KEY = 'chronos:import-mode';
const HTML_TERM_START_KEY = 'chronos:html-term-start';
const HTML_CAMPUS_ID_KEY = 'chronos:html-campus-id';

export interface PreviewSnapshot {
	preview: Timetable;
	previewSource: TransferImportSource;
	importMode: ImportMode;
}

export interface PreviewPersistence {
	save(snapshot: PreviewSnapshot): void;
	load(): PreviewSnapshot | null;
	clear(): void;
}

export function createSessionPreviewPersistence(
	storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
): PreviewPersistence {
	const resolvedStorage = storage ?? globalThis.sessionStorage;
	return {
		save({ preview, previewSource, importMode }) {
			resolvedStorage.setItem(PREVIEW_KEY, JSON.stringify(preview));
			resolvedStorage.setItem(PREVIEW_SOURCE_KEY, previewSource);
			resolvedStorage.setItem(IMPORT_MODE_KEY, importMode);
		},
		load() {
			const raw = resolvedStorage.getItem(PREVIEW_KEY);
			const source = resolvedStorage.getItem(PREVIEW_SOURCE_KEY) as TransferImportSource | null;
			if (!raw || !source) return null;
			try {
				return {
					preview: JSON.parse(raw) as Timetable,
					previewSource: source,
					importMode:
						(resolvedStorage.getItem(IMPORT_MODE_KEY) as ImportMode | null) ?? ImportMode.AS_NEW
				};
			} catch {
				return null;
			}
		},
		clear() {
			resolvedStorage.removeItem(PREVIEW_KEY);
			resolvedStorage.removeItem(PREVIEW_SOURCE_KEY);
			resolvedStorage.removeItem(IMPORT_MODE_KEY);
			resolvedStorage.removeItem(HTML_TERM_START_KEY);
			resolvedStorage.removeItem(HTML_CAMPUS_ID_KEY);
		}
	};
}
