import { describe, expect, it, vi } from 'vite-plus/test';
import { ImportMode } from '$lib/domain/import-mode';
import { createCourse, type ChronosEngine } from '@chronos/core';
import { createTimetable, TimetableImportSource } from '$lib/models/timetable';
import { createSessionPreviewPersistence } from './preview-persistence';
import { createTransferImportCoordinator } from './transfer-import-coordinator';
import { formatShareClipboardText } from '$lib/parsers/share-link/chronos-share-link-codec';
import { success } from '$lib/domain/result/app-result';
import type { ChronosTimetableShareLinkCodec } from '$lib/parsers/share-link/chronos-timetable-share-link-codec';

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

	it('applies campus period times when confirming HTML import', async () => {
		const saveTimetableMock = vi.fn().mockResolvedValue(undefined);
		const setActiveTimetableIdMock = vi.fn().mockResolvedValue(undefined);

		const mockEngine = {
			env: {
				storage: {
					saveTimetable: saveTimetableMock,
					setActiveTimetableId: setActiveTimetableIdMock,
					getActiveTimetableId: vi.fn().mockResolvedValue('active-1')
				}
			}
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
				termStartDate: '',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			},
			importMetadata: { source: TimetableImportSource.FILE_HTML },
			viewPrefs: {
				showSaturday: true,
				showSunday: true,
				showNonCurrentWeekCourses: false
			}
		});

		const result = await coordinator.confirmImport(
			preview,
			'HTML',
			ImportMode.AS_NEW,
			'2026-02-23',
			'huaxi'
		);

		expect(result).toEqual({ ok: true });
		expect(saveTimetableMock).toHaveBeenCalledWith(
			expect.objectContaining({
				academicConfig: expect.objectContaining({
					termStartDate: '2026-02-23'
				}),
				importMetadata: expect.objectContaining({
					campusId: 'huaxi'
				})
			})
		);
		expect(setActiveTimetableIdMock).toHaveBeenCalledWith('preview');
	});

	it('reads clipboard and previews share link text', async () => {
		const mockStorage: Record<string, string> = {};
		const decodeMock = vi.fn().mockResolvedValue(success({ name: 'From Share Link' }));
		const encodeMock = vi.fn();
		const mockShareLinkCodec = {
			decode: decodeMock,
			encode: encodeMock
		} as unknown as ChronosTimetableShareLinkCodec;

		const coordinator = createTransferImportCoordinator({
			shareLinkCodec: mockShareLinkCodec,
			previewPersistence: createSessionPreviewPersistence({
				getItem: (key) => mockStorage[key] ?? null,
				setItem: (key, value) => {
					mockStorage[key] = value;
				},
				removeItem: (key) => {
					delete mockStorage[key];
				}
			}),
			clipboard: {
				readText: async () => '  https://chronos.test/s#1.abc  ',
				writeText: async () => {}
			}
		});

		const result = await coordinator.previewFromClipboard();
		expect(result).toEqual({
			ok: true,
			preview: { name: 'From Share Link' },
			source: 'SHARE_LINK'
		});
		expect(decodeMock).toHaveBeenCalledWith('https://chronos.test/s#1.abc');
	});

	it('exports share link to clipboard', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		const clipboardText = formatShareClipboardText('知行理工', 'https://chronos.test/s#1.abc');
		const encodeMock = vi.fn().mockResolvedValue(success(clipboardText));
		const mockShareLinkCodec = {
			decode: vi.fn(),
			encode: encodeMock
		} as unknown as ChronosTimetableShareLinkCodec;

		const mockEngine = {
			state: {
				currentTimetable: { name: '知行理工' }
			}
		} as unknown as ChronosEngine;

		const coordinator = createTransferImportCoordinator({
			shareLinkCodec: mockShareLinkCodec,
			engine: mockEngine,
			clipboard: {
				readText: async () => '',
				writeText
			}
		});

		const result = await coordinator.exportToClipboard();
		expect(result).toEqual({ ok: true, statusMessage: '已复制课表链接' });
		expect(writeText).toHaveBeenCalledWith(clipboardText);
	});

	it('previews online schedule via cqut-online source slot', async () => {
		const mockTimetable = createTimetable({
			id: 'cqut-1',
			name: '在线课表',
			courses: [
				createCourse({
					id: 'c1',
					name: '高等数学',
					teacher: '张老师',
					location: '一教101',
					dayOfWeek: 1,
					startPeriod: 1,
					endPeriod: 2
				})
			],
			createdAt: 0,
			updatedAt: 0,
			importMetadata: {
				source: TimetableImportSource.ONLINE_EDU
			},
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			},
			viewPrefs: {
				showSaturday: true,
				showSunday: true,
				showNonCurrentWeekCourses: false
			}
		});

		const executeImportMock = vi.fn().mockResolvedValue(mockTimetable);
		const mockEngine = {
			slots: {
				getSlotItem: (slotName: string, id: string) =>
					slotName === 'import.source.tab' && id === 'cqut-online'
						? { executeImport: executeImportMock }
						: undefined
			},
			getPluginContext: vi.fn().mockReturnValue({})
		} as unknown as ChronosEngine;

		const coordinator = createTransferImportCoordinator({
			engine: mockEngine
		});

		const result = await coordinator.previewOnline('123456', 'password', false, {
			account: '123456',
			capabilitiesReady: true,
			hasSavedCredential: false,
			protectionAvailable: false,
			savedMode: null
		});

		expect(result).toEqual({
			ok: true,
			preview: mockTimetable,
			source: 'ONLINE',
			statusMessage: undefined
		});
		expect(executeImportMock).toHaveBeenCalledWith(
			{
				username: '123456',
				account: '123456',
				password: 'password'
			},
			expect.anything()
		);
	});
});
