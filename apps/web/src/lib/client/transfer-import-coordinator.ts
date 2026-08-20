import { ImportMode } from '$lib/domain/import-mode';
import type { CqutCampusId } from '$lib/models/cqut-campus';
import { getCampusDefaultPeriodTimes } from '$lib/models/cqut-campus';
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
		previewSource: TransferImportSource,
		importMode: ImportMode,
		htmlImportTermStartDate: string | null,
		htmlImportCampusId: CqutCampusId | null
	): Promise<ImportOutcome> {
		let finalPreview = preview;
		if (previewSource === 'HTML') {
			if (!htmlImportTermStartDate) {
				return { ok: false, errorMessage: '请选择学期起始日期' };
			}
			if (!htmlImportCampusId) {
				return { ok: false, errorMessage: '请选择校区' };
			}
			const periodTimes = getCampusDefaultPeriodTimes(htmlImportCampusId);
			finalPreview = {
				...preview,
				academicConfig: {
					...preview.academicConfig,
					termStartDate: htmlImportTermStartDate,
					periodTimes
				},
				importMetadata: {
					...preview.importMetadata,
					campusId: htmlImportCampusId
				}
			};
		}

		try {
			await getEngine().actions.importTimetable(finalPreview, {
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
