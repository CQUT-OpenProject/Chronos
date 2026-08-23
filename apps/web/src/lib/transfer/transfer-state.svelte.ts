import { createSessionPreviewPersistence } from '$lib/client/preview-persistence';
import type { Timetable } from '$lib/models/timetable';
import { ImportMode } from '$lib/domain/import-mode';
import { pickPrimary, resolveLocalizedText, type ChronosEngine } from '@chronos/core';
import { getDefaultImportSlot } from '$lib/config/features';
import { getAppController } from '$lib/services/app-engine';

export interface TransferPreviewState {
	preview: Timetable | null;
	selectedSlotId: string | undefined;
	previewSlotId: string | null;
	importMode: ImportMode;
	errorMessage: string | null;
}

function resolveInitialSlotId(): string | undefined {
	return getDefaultImportSlot();
}

export function createTransferState(engine?: ChronosEngine) {
	let selectedSlotId = $state(resolveInitialSlotId());
	let preview = $state<Timetable | null>(null);
	let previewSlotId = $state<string | null>(null);
	let importMode = $state<ImportMode>(ImportMode.AS_NEW);
	let errorMessage = $state<string | null>(null);

	const persistence = createSessionPreviewPersistence();

	function clearMessages() {
		errorMessage = null;
	}

	function setSelectedSlotId(slotId: string) {
		selectedSlotId = slotId;
		preview = null;
		previewSlotId = null;
		clearMessages();
	}

	function setImportMode(mode: ImportMode) {
		importMode = mode;
	}

	function clearPreview() {
		preview = null;
		previewSlotId = null;
		persistence.clear();
		clearMessages();
	}

	function setDirectPreview(t: Timetable, slotId: string) {
		clearMessages();
		preview = t;
		previewSlotId = slotId;
		return true;
	}

	async function executeSlotImport(
		tabId: string,
		inputs: Record<string, unknown>
	): Promise<Timetable> {
		const controller = getAppController();
		const tab = controller.getSlots('import.source.tab').find((item) => item.id === tabId);
		if (!tab) {
			throw new Error('导入源不可用');
		}
		const ctx = controller.getPluginContextForSlot('import.source.tab', tabId);
		const timetable = await tab.executeImport(inputs, ctx);
		if (!timetable?.courses?.length) {
			throw new Error('未识别到任何有效课程数据');
		}
		return timetable;
	}

	async function previewWithSlot(tabId: string, inputs: Record<string, unknown>): Promise<boolean> {
		clearMessages();
		try {
			const timetable = await executeSlotImport(tabId, inputs);
			preview = timetable;
			previewSlotId = tabId;
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '获取课表失败';
			return false;
		}
	}

	function persistPreview() {
		if (!preview || !previewSlotId) return false;
		persistence.save({
			preview,
			slotId: previewSlotId,
			importMode
		});
		return true;
	}

	function loadPersistedPreview(): boolean {
		const snapshot = persistence.load();
		if (!snapshot) return false;
		preview = snapshot.preview;
		previewSlotId = snapshot.slotId;
		importMode = snapshot.importMode;
		return true;
	}

	function clearPersistedPreview() {
		persistence.clear();
	}

	async function confirmImport() {
		clearMessages();
		if (!preview) {
			errorMessage = '请先获取课表';
			return false;
		}

		try {
			if (!engine) {
				throw new Error('ChronosEngine is required for ingest');
			}
			await engine.actions.importTimetable(preview, {
				overwriteActive: importMode === ImportMode.OVERWRITE_CURRENT
			});
			clearPreview();
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '保存课表失败';
			return false;
		}
	}

	async function getExportMetadata() {
		if (!engine) {
			return { timetableName: null, longLinkWarning: false, warningMessage: null };
		}
		const current = engine.state.currentTimetable;
		if (!current) {
			return { timetableName: null, longLinkWarning: false, warningMessage: null };
		}
		let warningMessage: string | null = null;
		try {
			const controller = getAppController();
			const primaryAction = pickPrimary(controller.getSlots('export.action'));
			if (primaryAction?.checkWarning) {
				const ctx = controller.getPluginContextForSlot('export.action', primaryAction.id);
				warningMessage = await primaryAction.checkWarning(current, ctx);
			}
		} catch {
			warningMessage = null;
		}

		return {
			timetableName: current.name,
			longLinkWarning: Boolean(warningMessage),
			warningMessage
		};
	}

	return {
		get state(): TransferPreviewState {
			return {
				preview,
				selectedSlotId,
				previewSlotId,
				importMode,
				errorMessage
			};
		},
		setSelectedSlotId,
		setImportMode,
		clearPreview,
		setDirectPreview,
		previewWithSlot,
		executeSlotImport,
		persistPreview,
		loadPersistedPreview,
		clearPersistedPreview,
		confirmImport,
		getExportMetadata
	};
}

export type TransferStateController = ReturnType<typeof createTransferState>;

export function resolveSlotTitle(slotId: string | null): string {
	if (!slotId) return '未知来源';
	try {
		const controller = getAppController();
		const slot = controller.getSlotItem('import.source.tab', slotId);
		if (slot) {
			return resolveLocalizedText(slot.title);
		}
	} catch {
		// Engine not ready
	}
	return slotId;
}
