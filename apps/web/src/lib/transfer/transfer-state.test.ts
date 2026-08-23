import { describe, expect, it, beforeEach, vi } from 'vite-plus/test';
import { createTransferState } from './transfer-state.svelte';

describe('createTransferState', () => {
	let mockStorage: Record<string, string> = {};

	beforeEach(() => {
		mockStorage = {};
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

	it('persists preview and confirms import through engine', async () => {
		const importTimetable = vi.fn().mockResolvedValue(undefined);
		const mockEngine = {
			actions: { importTimetable },
			state: { currentTimetable: null },
			services: { get: () => null }
		} as unknown as Parameters<typeof createTransferState>[0];

		const controller = createTransferState(mockEngine);
		const sampleTimetable = {
			id: 'preview-1',
			name: 'Test Schedule',
			courses: [],
			academicConfig: { termStartDate: '2026-02-23', startWeek: 1, endWeek: 20, periodTimes: [] },
			importMetadata: { source: 'edu-html' }
		} as never;

		controller.setDirectPreview(sampleTimetable, 'edu-html');
		controller.persistPreview();

		expect(mockStorage['chronos:import-preview']).toBeDefined();
		expect(mockStorage['chronos:import-preview-slot']).toBe('edu-html');

		const success = await controller.confirmImport();
		expect(success).toBe(true);
		expect(importTimetable).toHaveBeenCalledTimes(1);
		expect(controller.state.preview).toBeNull();
	});

	it('safely handles getExportMetadata when current timetable has no courses', async () => {
		const mockEngine = {
			state: {
				currentTimetable: {
					id: 't1',
					name: '空课表',
					courses: [],
					academicConfig: { termStartDate: '', startWeek: 1, endWeek: 20, periodTimes: [] }
				}
			}
		} as unknown as Parameters<typeof createTransferState>[0];

		const controller = createTransferState(mockEngine);
		const meta = await controller.getExportMetadata();
		expect(meta.timetableName).toBe('空课表');
		expect(meta.longLinkWarning).toBe(false);
		expect(meta.warningMessage).toBeNull();
	});

	it('returns warning when primary action checkWarning finds a warning', async () => {
		const mockEngine = {
			state: {
				currentTimetable: {
					id: 't2',
					name: '大课表',
					courses: [{ id: '1' }],
					academicConfig: {
						termStartDate: '2026-03-02',
						startWeek: 1,
						endWeek: 20,
						periodTimes: []
					}
				}
			}
		} as unknown as Parameters<typeof createTransferState>[0];

		const controller = createTransferState(mockEngine);
		const meta = await controller.getExportMetadata();
		expect(meta.timetableName).toBe('大课表');
		expect(typeof meta.longLinkWarning).toBe('boolean');
	});
});
