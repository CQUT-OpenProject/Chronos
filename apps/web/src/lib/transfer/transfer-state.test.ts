import { describe, expect, it, beforeEach, vi } from 'vite-plus/test';
import { ImportMode } from '$lib/domain/import-mode';
import { createTransferState, shareImportErrorSnackbarKey } from './transfer-state.svelte';

vi.mock('$lib/i18n/host-i18n.svelte', () => ({
	hostT: (key: string) => key
}));

const finalizePreview = vi.fn(async (preview: { name: string }) => ({
	...preview,
	name: 'Finalized'
}));

vi.mock('$lib/services/app-engine', () => ({
	getAppController: () => ({
		getSlots: (slot: string) =>
			slot === 'import.source.tab'
				? [...slotImportHandlers.entries()].map(([id, executeImport]) => ({
						id,
						executeImport
					}))
				: [],
		getSlotItem: (_slot: string, id: string) =>
			id === 'finalize-slot'
				? {
						validateConfirmInputs: () => null,
						finalizePreview
					}
				: undefined,
		getPluginContextForSlot: () => undefined
	})
}));

const slotImportHandlers = new Map<string, (inputs: Record<string, unknown>) => Promise<unknown>>();

describe('createTransferState', () => {
	let mockStorage: Record<string, string> = {};

	beforeEach(() => {
		mockStorage = {};
		slotImportHandlers.clear();
		vi.stubGlobal('sessionStorage', {
			getItem: (key: string) => mockStorage[key] ?? null,
			setItem: (key: string, value: string) => {
				mockStorage[key] = value;
			},
			removeItem: (key: string) => {
				delete mockStorage[key];
			}
		});
	});

	it('clears preview from memory and sessionStorage when clearPreview is called', () => {
		const controller = createTransferState();

		mockStorage['chronos:import-preview'] = JSON.stringify({ name: 'Test' });
		mockStorage['chronos:import-preview-slot'] = 'share-link';

		controller.loadPersistedPreview();
		expect(controller.state.preview).toEqual({ name: 'Test' });
		expect(controller.state.previewSlotId).toBe('share-link');

		controller.clearPreview();
		expect(controller.state.preview).toBeNull();
		expect(mockStorage['chronos:import-preview']).toBeUndefined();
	});

	it('clears sessionStorage when clearPersistedPreview is called', () => {
		const controller = createTransferState();

		mockStorage['chronos:import-preview'] = JSON.stringify({ name: 'Test' });
		mockStorage['chronos:import-preview-slot'] = 'share-link';

		controller.clearPersistedPreview();
		expect(mockStorage['chronos:import-preview']).toBeUndefined();
		expect(mockStorage['chronos:import-preview-slot']).toBeUndefined();
	});

	it('skips confirmInputs update when values are unchanged', () => {
		const controller = createTransferState();
		controller.setConfirmInputs({ campusId: 'huaxi', termStartDate: '' });
		const snapshot = controller.state.confirmInputs;
		controller.setConfirmInputs({ campusId: 'huaxi' });
		expect(controller.state.confirmInputs).toBe(snapshot);
	});

	describe('shareImportErrorSnackbarKey', () => {
		it('maps failure kinds to distinct messages', () => {
			expect(shareImportErrorSnackbarKey('no-data')).toBe('share.error.noData');
			expect(shareImportErrorSnackbarKey('invalid-data')).toBe('share.error.invalidData');
			expect(shareImportErrorSnackbarKey('network')).toBe('share.error.network');
		});
	});

	it('persists and restores confirmInputs with preview snapshot', async () => {
		const controller = createTransferState();
		const sampleTimetable = {
			id: 'preview-1',
			name: 'Test Schedule',
			courses: [{ id: 'c1' }],
			academicConfig: { termStartDate: '', startWeek: 1, endWeek: 20, periodTimes: [] }
		} as never;

		slotImportHandlers.set('edu-html', async () => sampleTimetable);
		expect(await controller.previewWithSlot('edu-html', {})).toBe(true);
		controller.setConfirmInputs({ campusId: 'huaxi', termStartDate: '2026-02-23' });
		controller.persistPreview();
		const next = createTransferState();
		expect(next.loadPersistedPreview()).toBe(true);
		expect(next.state.confirmInputs).toEqual({
			campusId: 'huaxi',
			termStartDate: '2026-02-23'
		});
	});

	it('calls finalizePreview before importing through engine', async () => {
		finalizePreview.mockClear();
		const importTimetable = vi.fn().mockResolvedValue(undefined);
		const mockEngine = {
			importTimetable,
			state: { currentTimetable: null },
			services: { get: () => null }
		} as unknown as Parameters<typeof createTransferState>[0];

		const controller = createTransferState(mockEngine);
		const sampleTimetable = {
			id: 'preview-1',
			name: 'Test Schedule',
			courses: [{ id: 'c1' }],
			academicConfig: { termStartDate: '', startWeek: 1, endWeek: 20, periodTimes: [] }
		} as never;

		slotImportHandlers.set('finalize-slot', async () => sampleTimetable);
		expect(await controller.previewWithSlot('finalize-slot', {})).toBe(true);
		controller.setConfirmInputs({ termStartDate: '2026-02-23' });

		const success = await controller.confirmImport();
		expect(success).toBe(true);
		expect(finalizePreview).toHaveBeenCalledTimes(1);
		expect(importTimetable).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'Finalized' }),
			expect.any(Object)
		);
	});

	it('persists preview and confirms import through engine', async () => {
		const importTimetable = vi.fn().mockResolvedValue(undefined);
		const mockEngine = {
			importTimetable,
			state: { currentTimetable: null },
			services: { get: () => null }
		} as unknown as Parameters<typeof createTransferState>[0];

		const controller = createTransferState(mockEngine);
		const sampleTimetable = {
			id: 'preview-1',
			name: 'Test Schedule',
			courses: [{ id: 'c1' }],
			academicConfig: { termStartDate: '2026-02-23', startWeek: 1, endWeek: 20, periodTimes: [] },
			importMetadata: { source: 'share-link' }
		} as never;

		slotImportHandlers.set('share-link', async () => sampleTimetable);
		expect(await controller.previewWithSlot('share-link', {})).toBe(true);
		controller.persistPreview();

		expect(mockStorage['chronos:import-preview']).toBeDefined();
		expect(mockStorage['chronos:import-preview-slot']).toBe('share-link');

		const success = await controller.confirmImport();
		expect(success).toBe(true);
		expect(importTimetable).toHaveBeenCalledTimes(1);
		expect(controller.state.preview).toBeNull();
	});

	it('checkPrimaryExportWarning returns null when engine has no timetable', async () => {
		const mockEngine = {
			state: { currentTimetable: null }
		} as unknown as Parameters<typeof createTransferState>[0];

		const { checkPrimaryExportWarning } = await import('$lib/transfer/transfer-state.svelte');
		const warning = await checkPrimaryExportWarning(mockEngine!);
		expect(warning).toBeNull();
	});

	it('rejects overwrite import mode when no current timetable exists', async () => {
		const importTimetable = vi.fn().mockResolvedValue(undefined);
		const mockEngine = {
			importTimetable,
			state: { currentTimetable: null },
			services: { get: () => null }
		} as unknown as Parameters<typeof createTransferState>[0];

		const controller = createTransferState(mockEngine);
		const sampleTimetable = {
			id: 'preview-1',
			name: 'Test Schedule',
			courses: [{ id: 'c1' }],
			academicConfig: { termStartDate: '2026-02-23', startWeek: 1, endWeek: 20, periodTimes: [] }
		} as never;

		slotImportHandlers.set('share-link', async () => sampleTimetable);
		expect(await controller.previewWithSlot('share-link', {})).toBe(true);
		expect(controller.setImportMode(ImportMode.OVERWRITE_CURRENT)).toBe(false);
		expect(controller.state.importMode).toBe(ImportMode.AS_NEW);

		const success = await controller.confirmImport();
		expect(success).toBe(true);
		expect(importTimetable).toHaveBeenCalledWith(sampleTimetable, { overwriteActive: false });
	});
});
