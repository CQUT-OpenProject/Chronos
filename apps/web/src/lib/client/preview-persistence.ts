import type { Timetable } from '@chronos/core';
import { ImportMode } from '$lib/domain/import-mode';

const PREVIEW_KEY = 'chronos:import-preview';
const PREVIEW_SLOT_KEY = 'chronos:import-preview-slot';
const IMPORT_MODE_KEY = 'chronos:import-mode';

export interface PreviewSnapshot {
	preview: Timetable;
	slotId: string;
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
		save({ preview, slotId, importMode }) {
			resolvedStorage.setItem(PREVIEW_KEY, JSON.stringify(preview));
			resolvedStorage.setItem(PREVIEW_SLOT_KEY, slotId);
			resolvedStorage.setItem(IMPORT_MODE_KEY, importMode);
		},
		load() {
			const raw = resolvedStorage.getItem(PREVIEW_KEY);
			const slotId = resolvedStorage.getItem(PREVIEW_SLOT_KEY);
			if (!raw || !slotId) return null;
			try {
				return {
					preview: JSON.parse(raw) as Timetable,
					slotId,
					importMode:
						(resolvedStorage.getItem(IMPORT_MODE_KEY) as ImportMode | null) ?? ImportMode.AS_NEW
				};
			} catch {
				return null;
			}
		},
		clear() {
			resolvedStorage.removeItem(PREVIEW_KEY);
			resolvedStorage.removeItem(PREVIEW_SLOT_KEY);
			resolvedStorage.removeItem(IMPORT_MODE_KEY);
		}
	};
}
