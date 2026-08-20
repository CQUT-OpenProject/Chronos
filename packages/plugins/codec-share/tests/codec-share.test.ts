import { describe, it, expect, vi } from 'vite-plus/test';
import {
	ChronosEngine,
	createCourse,
	createTimetable,
	type ChronosEnv,
	type UserPreferences
} from '@chronos/core';
import { shareCodecPlugin } from '../src/index';

function createMockEnv(): ChronosEnv {
	return {
		platform: 'web',
		http: { request: vi.fn() },
		storage: {
			getTimetable: vi.fn(async () => null),
			listTimetables: vi.fn(async () => []),
			saveTimetable: vi.fn(async () => {}),
			patchTimetable: vi.fn(async () => {}),
			deleteTimetable: vi.fn(async () => {}),
			getActiveTimetableId: vi.fn(async () => null),
			setActiveTimetableId: vi.fn(async () => {}),
			getPreferences: vi.fn(async (): Promise<UserPreferences> => ({
				schemaVersion: 1,
				themeMode: 'auto',
				paletteMode: 'vibrant',
				timetableLayoutMode: 'fixed',
				capsuleCornerStyle: 'rounded',
				hapticFeedbackEnabled: true
			})),
			savePreferences: vi.fn(async () => {}),
			getPluginData: vi.fn(async () => null),
			setPluginData: vi.fn(async () => {}),
			deletePluginData: vi.fn(async () => {})
		},
		vault: {
			isSupported: vi.fn(async () => true),
			storeSecret: vi.fn(async () => {}),
			getSecret: vi.fn(async () => null),
			removeSecret: vi.fn(async () => {})
		},
		runtime: {
			setTimeout: vi.fn(),
			clearTimeout: vi.fn(),
			sha256: vi.fn(async () => ''),
			encodeUtf8: vi.fn(),
			decodeUtf8: vi.fn()
		}
	};
}

describe('shareCodecPlugin', () => {
	const sampleTimetable = createTimetable({
		id: 't1',
		name: '计算机课表',
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		},
		courses: [
			createCourse({
				id: 'c1',
				name: '操作系统',
				teacher: '周老师',
				location: '计科楼402',
				dayOfWeek: 2,
				startPeriod: 3,
				endPeriod: 4,
				weeks: [1, 2, 3]
			})
		]
	});

	it('loads plugin and registers import.source.tab and export.action slots', async () => {
		const env = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(shareCodecPlugin);

		const sourceSlot = engine.slots.getSlotItem('import.source.tab', 'share-link');
		expect(sourceSlot).toBeDefined();
		expect(engine.slots.getSlotItem('import.source.tab', 'share-json')).toBeUndefined();

		const exportSlot = engine.slots.getSlotItem('export.action', 'share-link');
		expect(exportSlot).toBeDefined();
		expect(engine.slots.getSlotItem('export.action', 'share-json')).toBeUndefined();

		const ctx = engine.getPluginContext('codec-share');
		const exported = await exportSlot!.export(sampleTimetable, ctx);
		expect(exported.filename).toBe('share-link.txt');
		expect(exported.mimeType).toBe('application/x-chronos-share-link');
		expect(exported.content).toContain('计算机课表');

		const imported = await sourceSlot!.executeImport({ content: exported.content as string }, ctx);
		expect(imported.name).toBe('计算机课表');
		expect(imported.courses.length).toBe(1);
		expect(imported.courses[0]?.name).toBe('操作系统');

		handle.dispose();
		expect(engine.slots.getSlotItem('import.source.tab', 'share-link')).toBeUndefined();
		expect(engine.slots.getSlotItem('export.action', 'share-link')).toBeUndefined();
	});
});
