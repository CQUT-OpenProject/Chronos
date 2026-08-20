import { createTransferImportCoordinator } from '$lib/client/transfer-import-coordinator';
import type { TransferImportSource } from '$lib/client/preview-persistence';
import type { Timetable } from '$lib/models/timetable';
import { ImportMode } from '$lib/domain/import-mode';
import type { ChronosEngine } from '@chronos/core';

export type { TransferImportSource };

export interface TransferPreviewState {
	preview: Timetable | null;
	previewSource: TransferImportSource | null;
	importMode: ImportMode;
	errorMessage: string | null;
	statusMessage: string | null;
}

export function createTransferState(engine?: ChronosEngine) {
	let preview = $state<Timetable | null>(null);
	let previewSource = $state<TransferImportSource | null>(null);
	let importMode = $state<ImportMode>(ImportMode.AS_NEW);
	let errorMessage = $state<string | null>(null);
	let statusMessage = $state<string | null>(null);

	const coordinator = createTransferImportCoordinator({ engine });

	function clearMessages() {
		errorMessage = null;
		statusMessage = null;
	}

	function setImportMode(mode: ImportMode) {
		importMode = mode;
	}

	function clearPreview() {
		preview = null;
		previewSource = null;
		coordinator.clearPersistedPreview();
		clearMessages();
	}

	function setDirectPreview(t: Timetable, source: TransferImportSource = 'SHARE_LINK') {
		clearMessages();
		preview = t;
		previewSource = source;
		return true;
	}

	function persistPreview() {
		if (!preview || !previewSource) return false;
		return coordinator.persistPreview({
			preview,
			previewSource,
			importMode,
			htmlImportTermStartDate: null,
			htmlImportCampusId: null
		});
	}

	function loadPersistedPreview(): boolean {
		const snapshot = coordinator.loadPersistedPreview();
		if (!snapshot) return false;
		preview = snapshot.preview;
		previewSource = snapshot.previewSource;
		importMode = snapshot.importMode;
		return true;
	}

	function clearPersistedPreview() {
		coordinator.clearPersistedPreview();
	}

	async function confirmImport() {
		clearMessages();
		if (!preview || !previewSource) {
			errorMessage = '请先获取课表';
			return false;
		}

		const result = await coordinator.confirmImport(preview, previewSource, importMode);

		if (!result.ok) {
			errorMessage = result.errorMessage;
			return false;
		}

		clearPreview();
		return true;
	}

	async function getExportMetadata() {
		return await coordinator.getExportMetadata();
	}

	return {
		get state(): TransferPreviewState {
			return {
				preview,
				previewSource,
				importMode,
				errorMessage,
				statusMessage
			};
		},
		setImportMode,
		clearPreview,
		setDirectPreview,
		persistPreview,
		loadPersistedPreview,
		clearPersistedPreview,
		confirmImport,
		getExportMetadata
	};
}

export type TransferStateController = ReturnType<typeof createTransferState>;
