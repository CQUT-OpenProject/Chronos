import { ImportMode } from '$lib/domain/import-mode';
import type { Timetable } from '$lib/models/timetable';
import {
	createSessionPreviewPersistence,
	type PreviewPersistence,
	type PreviewSnapshot,
	type TransferImportSource
} from './preview-persistence';
import { estimateShareLinkLength, SHARE_LINK_WARNING_LENGTH } from '@chronos/plugin-codec-share';
import type { ChronosEngine } from '@chronos/core';

export type { TransferImportSource };

export type ImportOutcome = { ok: true } | { ok: false; errorMessage: string };

export interface IImportSessionCoordinator {
	persistPreview(snapshot: PreviewSnapshot): boolean;
	loadPersistedPreview(): PreviewSnapshot | null;
	clearPersistedPreview(): void;
	confirmImport(
		preview: Timetable,
		previewSource: TransferImportSource,
		importMode: ImportMode
	): Promise<ImportOutcome>;
	getExportMetadata(): Promise<{ timetableName: string | null; longLinkWarning: boolean }>;
}

export interface TransferImportCoordinatorDeps {
	previewPersistence?: PreviewPersistence;
	engine?: ChronosEngine;
}

export function createTransferImportCoordinator({
	previewPersistence = createSessionPreviewPersistence(),
	engine
}: TransferImportCoordinatorDeps): IImportSessionCoordinator {
	const getEngine = () => {
		if (!engine) {
			throw new Error('ChronosEngine is required for ingest');
		}
		return engine;
	};

	function persistPreview(snapshot: PreviewSnapshot): boolean {
		previewPersistence.save(snapshot);
		return true;
	}

	function loadPersistedPreview(): PreviewSnapshot | null {
		return previewPersistence.load();
	}

	function clearPersistedPreview(): void {
		previewPersistence.clear();
	}

	async function confirmImport(
		preview: Timetable,
		_previewSource: TransferImportSource,
		importMode: ImportMode
	): Promise<ImportOutcome> {
		try {
			await getEngine().actions.importTimetable(preview, {
				overwriteActive: importMode === ImportMode.OVERWRITE_CURRENT
			});
			return { ok: true };
		} catch (err) {
			const msg = err instanceof Error ? err.message : '保存课表失败';
			return { ok: false, errorMessage: msg };
		}
	}

	async function getExportMetadata() {
		const current = getEngine().state.currentTimetable;
		if (!current) {
			return { timetableName: null, longLinkWarning: false };
		}
		const length = await estimateShareLinkLength(current);
		return {
			timetableName: current.name,
			longLinkWarning: length > SHARE_LINK_WARNING_LENGTH
		};
	}

	return {
		persistPreview,
		loadPersistedPreview,
		clearPersistedPreview,
		confirmImport,
		getExportMetadata
	};
}

export type TransferImportCoordinator = IImportSessionCoordinator;
