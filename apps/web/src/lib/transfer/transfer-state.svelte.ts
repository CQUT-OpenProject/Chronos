import { hostT } from '$lib/i18n/host-i18n.svelte';
import { createSessionPreviewPersistence } from '$lib/client/preview-persistence';
import type { Timetable } from '$lib/models/timetable';
import { ImportMode } from '$lib/domain/import-mode';
import {
	ImportSlotError,
	pickPrimary,
	resolveLocalizedText,
	type ChronosEngine,
	type ImportSlotErrorKind
} from '@chronos/core';
import { getDefaultImportSlot } from '$lib/config/features';
import { getAppController } from '$lib/services/app-engine';
import { resolveDeepLinkImport } from '$lib/transfer/deep-link';

export interface TransferPreviewState {
	preview: Timetable | null;
	selectedSlotId: string | undefined;
	previewSlotId: string | null;
	confirmInputs: Record<string, unknown>;
	importMode: ImportMode;
	errorMessage: string | null;
}

function resolveInitialSlotId(): string | undefined {
	return getDefaultImportSlot();
}

function resolveConfirmDefaults(tabId: string): Record<string, unknown> {
	try {
		const controller = getAppController();
		const tab = controller.getSlotItem('import.source.tab', tabId);
		return tab?.confirmDefaultInput ? { ...tab.confirmDefaultInput } : {};
	} catch {
		return {};
	}
}

export async function checkPrimaryExportWarning(engine: ChronosEngine): Promise<string | null> {
	const current = engine.state.currentTimetable;
	if (!current) return null;
	try {
		const controller = getAppController();
		const primaryAction = pickPrimary(controller.getSlots('export.action'));
		if (!primaryAction?.checkWarning) return null;
		const ctx = controller.getPluginContextForSlot('export.action', primaryAction.id);
		return (await primaryAction.checkWarning(current, ctx)) ?? null;
	} catch {
		return null;
	}
}

export function createTransferState(engine?: ChronosEngine) {
	let selectedSlotId = $state(resolveInitialSlotId());
	let preview = $state.raw<Timetable | null>(null);
	let previewSlotId = $state<string | null>(null);
	let confirmInputs = $state<Record<string, unknown>>({});
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
		confirmInputs = {};
		clearMessages();
	}

	function setImportMode(mode: ImportMode): boolean {
		if (mode === ImportMode.OVERWRITE_CURRENT && !engine?.state.currentTimetable) {
			errorMessage = hostT('transfer.confirm.noOverwrite');
			return false;
		}
		importMode = mode;
		clearMessages();
		return true;
	}

	function setConfirmInputs(inputs: Record<string, unknown>) {
		const next = { ...confirmInputs, ...inputs };
		const changed = (Object.keys(inputs) as Array<keyof typeof inputs>).some(
			(key) => confirmInputs[key as string] !== next[key as string]
		);
		if (!changed) return;
		confirmInputs = next;
	}

	function clearPreview() {
		preview = null;
		previewSlotId = null;
		confirmInputs = {};
		persistence.clear();
		clearMessages();
	}

	function setDirectPreview(t: Timetable, slotId: string) {
		clearMessages();
		preview = t;
		previewSlotId = slotId;
		confirmInputs = resolveConfirmDefaults(slotId);
		return true;
	}

	async function executeSlotImport(
		tabId: string,
		inputs: Record<string, unknown>
	): Promise<Timetable> {
		const controller = getAppController();
		const tab = controller.getSlots('import.source.tab').find((item) => item.id === tabId);
		if (!tab) {
			throw new ImportSlotError('unsupported', hostT('transfer.error.slotUnavailable'));
		}
		const ctx = controller.getPluginContextForSlot('import.source.tab', tabId);
		const timetable = await tab.executeImport(inputs, ctx);
		if (!timetable?.courses?.length) {
			throw new ImportSlotError('invalid-data', hostT('transfer.error.noCourses'));
		}
		return timetable;
	}

	async function previewWithSlot(tabId: string, inputs: Record<string, unknown>): Promise<boolean> {
		clearMessages();
		try {
			const timetable = await executeSlotImport(tabId, inputs);
			preview = timetable;
			previewSlotId = tabId;
			confirmInputs = resolveConfirmDefaults(tabId);
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : hostT('transfer.error.fetchFailed');
			return false;
		}
	}

	async function previewAndPersist(
		tabId: string,
		inputs: Record<string, unknown>
	): Promise<{ ok: true } | { ok: false; kind: ImportSlotErrorKind }> {
		clearMessages();
		try {
			const timetable = await executeSlotImport(tabId, inputs);
			preview = timetable;
			previewSlotId = tabId;
			confirmInputs = resolveConfirmDefaults(tabId);
			persistPreview();
			return { ok: true };
		} catch (err) {
			const kind = err instanceof ImportSlotError ? err.kind : 'unknown';
			return { ok: false, kind };
		}
	}

	async function previewDeepLinkImport(
		location: Pick<Location, 'hash' | 'search'>
	): Promise<{ ok: true } | { ok: false; kind: ImportSlotErrorKind }> {
		if (!engine) {
			return { ok: false, kind: 'unknown' };
		}
		const match = resolveDeepLinkImport(engine.slots.get('import.source.tab'), location);
		if (!match) {
			return { ok: false, kind: 'no-data' };
		}
		return previewAndPersist(match.tab.id, match.inputs);
	}

	function persistPreview() {
		if (!preview || !previewSlotId) return false;
		persistence.save({
			preview,
			slotId: previewSlotId,
			importMode,
			confirmInputs
		});
		return true;
	}

	function loadPersistedPreview(): boolean {
		const snapshot = persistence.load();
		if (!snapshot) return false;
		preview = snapshot.preview;
		previewSlotId = snapshot.slotId;
		importMode = snapshot.importMode;
		confirmInputs = snapshot.confirmInputs ?? resolveConfirmDefaults(snapshot.slotId);
		return true;
	}

	function clearPersistedPreview() {
		persistence.clear();
	}

	async function confirmImport() {
		clearMessages();
		if (!preview || !previewSlotId) {
			errorMessage = hostT('transfer.error.previewRequired');
			return false;
		}

		if (importMode === ImportMode.OVERWRITE_CURRENT && !engine?.state.currentTimetable) {
			errorMessage = hostT('transfer.confirm.noOverwrite');
			return false;
		}

		try {
			const controller = getAppController();
			const tab = controller.getSlotItem('import.source.tab', previewSlotId);
			if (tab?.validateConfirmInputs) {
				const validationError = tab.validateConfirmInputs(confirmInputs);
				if (validationError) {
					errorMessage = validationError;
					return false;
				}
			}

			let finalPreview = preview;
			if (tab?.finalizePreview) {
				const ctx = controller.getPluginContextForSlot('import.source.tab', previewSlotId);
				finalPreview = await tab.finalizePreview(preview, confirmInputs, ctx);
			}

			if (!engine) {
				throw new Error('ChronosEngine is required for ingest');
			}
			await engine.importTimetable(finalPreview, {
				overwriteActive: importMode === ImportMode.OVERWRITE_CURRENT
			});
			clearPreview();
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : hostT('transfer.error.saveFailed');
			return false;
		}
	}

	return {
		get state(): TransferPreviewState {
			return {
				preview,
				selectedSlotId,
				previewSlotId,
				confirmInputs,
				importMode,
				errorMessage
			};
		},
		setSelectedSlotId,
		setImportMode,
		setConfirmInputs,
		clearPreview,
		setDirectPreview,
		previewWithSlot,
		executeSlotImport,
		previewAndPersist,
		previewDeepLinkImport,
		persistPreview,
		loadPersistedPreview,
		clearPersistedPreview,
		confirmImport
	};
}

export type TransferStateController = ReturnType<typeof createTransferState>;

export function resolveSlotTitle(slotId: string | null): string {
	if (!slotId) return hostT('transfer.slot.unknown');
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

export function shareImportErrorSnackbarKey(kind: ImportSlotErrorKind): string {
	switch (kind) {
		case 'no-data':
			return 'share.error.noData';
		case 'invalid-data':
			return 'share.error.invalidData';
		case 'unsupported':
			return 'share.error.parseFailed';
		case 'network':
			return 'share.error.parseFailed';
		default:
			return 'share.error.parseFailed';
	}
}
