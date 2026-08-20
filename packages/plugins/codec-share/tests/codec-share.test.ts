import { describe, it, expect, vi } from 'vite-plus/test';
import {
	ChronosEngine,
	createCourse,
	createTimetable,
	type ChronosEnv,
	type UserPreferences
} from '@chronos/core';
import { shareCodecPlugin, exportTimetableToJson, parseTimetableFromJson } from '../src/index';

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

	it('exports and parses JSON timetable', () => {
		const jsonStr = exportTimetableToJson(sampleTimetable);
		expect(typeof jsonStr).toBe('string');
		expect(jsonStr).toContain('计算机课表');
		expect(jsonStr).toContain('操作系统');

		const parsed = parseTimetableFromJson(jsonStr);
		expect(parsed.id).toBe('t1');
		expect(parsed.name).toBe('计算机课表');
		expect(parsed.courses.length).toBe(1);
		expect(parsed.courses[0]?.name).toBe('操作系统');
	});

	it('loads plugin and registers import.source.tab and export.action slots', async () => {
		const env = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(shareCodecPlugin);

		const sourceSlot = engine.slots.getSlotItem('import.source.tab', 'share-link');
		expect(sourceSlot).toBeDefined();
		expect(engine.slots.getSlotItem('import.source.tab', 'share-json')).toBeUndefined();

		const exportSlot = engine.slots.getSlotItem('export.action', 'share-json');
		expect(exportSlot).toBeDefined();

		const ctx = engine.getPluginContext('codec-share');
		const exported = await exportSlot!.export(sampleTimetable, ctx);
		expect(exported.filename).toBe('计算机课表.json');
		expect(exported.mimeType).toBe('application/json');

		handle.dispose();
		expect(engine.slots.getSlotItem('import.source.tab', 'share-link')).toBeUndefined();
		expect(engine.slots.getSlotItem('export.action', 'share-json')).toBeUndefined();
	});
});
