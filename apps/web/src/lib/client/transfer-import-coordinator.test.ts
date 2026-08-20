import { describe, expect, it, vi } from 'vite-plus/test';
import { ImportMode } from '$lib/domain/import-mode';
import { createCourse, type ChronosEngine } from '@chronos/core';
import { createTimetable, TimetableImportSource } from '$lib/models/timetable';
import { createSessionPreviewPersistence } from './preview-persistence';
import { createTransferImportCoordinator } from './transfer-import-coordinator';

describe('createTransferImportCoordinator', () => {
	it('persists and loads preview snapshot via preview persistence', () => {
		const storage: Record<string, string> = {};
		const mockStorage = {
			getItem: (key: string) => storage[key] ?? null,
			setItem: (key: string, value: string) => {
				storage[key] = value;
			},
			removeItem: (key: string) => {
				delete storage[key];
			}
		};

		const coordinator = createTransferImportCoordinator({
			previewPersistence: createSessionPreviewPersistence(mockStorage)
		});

		const timetable = { name: 'Test Timetable' } as never;
		coordinator.persistPreview({
			preview: timetable,
			previewSource: 'SHARE_LINK',
			importMode: ImportMode.AS_NEW,
			htmlImportTermStartDate: null,
			htmlImportCampusId: null
		});

		expect(coordinator.loadPersistedPreview()).toEqual({
			preview: timetable,
			previewSource: 'SHARE_LINK',
			importMode: ImportMode.AS_NEW,
			htmlImportTermStartDate: null,
			htmlImportCampusId: null
		});

		coordinator.clearPersistedPreview();
		expect(coordinator.loadPersistedPreview()).toBeNull();
	});

	it('imports via Engine.importTimetable', async () => {
		const importTimetable = vi.fn().mockResolvedValue(undefined);
		const mockEngine = {
			actions: { importTimetable },
			state: { currentTimetable: null }
		} as unknown as ChronosEngine;

		const coordinator = createTransferImportCoordinator({
			engine: mockEngine
		});

		const preview = createTimetable({
			id: 'preview',
			name: 'HTML 课表',
			courses: [
				createCourse({
					id: 'c1',
					name: '课程',
					teacher: '教师',
					location: '花溪校区 A101',
					dayOfWeek: 1,
					startPeriod: 1,
					endPeriod: 2,
					color: '#EADDFF'
				})
			],
			createdAt: 0,
			updatedAt: 0,
			academicConfig: {
				termStartDate: '2026-02-23',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			},
			importMetadata: { source: TimetableImportSource.FILE_HTML, campusId: 'huaxi' },
			viewPrefs: {
				showSaturday: true,
				showSunday: true,
				showNonCurrentWeekCourses: false
			}
		});

		const result = await coordinator.confirmImport(preview, 'HTML', ImportMode.AS_NEW);

		expect(result).toEqual({ ok: true });
		expect(importTimetable).toHaveBeenCalledWith(preview, { overwriteActive: false });
	});
});
