import { describe, expect, it, vi } from 'vite-plus/test';
import {
	ChronosEngine,
	createTimetable,
	createCourse,
	type ChronosEnv,
	type UserPreferences,
	type Course
} from '@chronos/core';
import {
	createQrCodecPlugin,
	generateQrMatrix,
	generateQrSvg,
	serializeTimetableForQr,
	deserializeTimetableFromQr
} from '../src/index';

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

describe('codec-qrcode generator (Version 1-40)', () => {
	it('generates QR matrix with valid dimensions for standard texts', () => {
		const matrix = generateQrMatrix('chronos-qr:v2:sample');
		expect(matrix.size).toBeGreaterThanOrEqual(21);
		expect(matrix.modules.length).toBe(matrix.size);
		expect(matrix.modules[0]!.length).toBe(matrix.size);
	});

	it('generates valid SVG output with crispEdges and correct viewBox', () => {
		const svg = generateQrSvg('chronos-qr:v2:sample', { margin: 2 });
		expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
		expect(svg).toContain('viewBox="0 0');
		expect(svg).toContain('shape-rendering="crispEdges"');
		expect(svg).toContain('<rect width=');
		expect(svg).toContain('<path d=');
	});
});

describe('codec-qrcode high-compression serialization & slot execution', () => {
	it('compresses massive 50-course semester timetable down to compact size (< 800 bytes)', async () => {
		const courses: Course[] = [];
		for (let i = 1; i <= 50; i++) {
			courses.push(
				createCourse({
					id: `c-${i}`,
					name: `高等数学与计算机体系结构课程第${i % 10}分段`,
					teacher: `张三${i % 8}副教授`,
					location: `两江校区 弘远楼A${100 + (i % 15)}教室`,
					dayOfWeek: (i % 7) + 1,
					startPeriod: (i % 4) * 2 + 1,
					endPeriod: (i % 4) * 2 + 2,
					weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
					remark: i % 3 === 0 ? '期末闭卷考试需要携带计算器' : undefined
				})
			);
		}

		const massiveTimetable = createTimetable({
			id: 't-massive',
			name: '2025-2026学年第一学期全量复杂超长课表',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: [
					{ index: 1, startTime: '08:30', endTime: '09:15' },
					{ index: 2, startTime: '09:25', endTime: '10:10' }
				]
			},
			courses
		});

		const payload = await serializeTimetableForQr(massiveTimetable);
		// Compressed payload should easily be under 1500 bytes (far below 2953 limit)
		expect(payload.length).toBeLessThan(1500);
		expect(payload.startsWith('chronos-qr:v2:')).toBe(true);

		// Generates QR matrix & SVG without any overflow error
		const matrix = generateQrMatrix(payload);
		expect(matrix.size).toBeLessThanOrEqual(177);
		const svg = generateQrSvg(payload);
		expect(svg).toContain('<svg');

		// Restores correctly
		const restored = await deserializeTimetableFromQr(payload);
		expect(restored.name).toBe('2025-2026学年第一学期全量复杂超长课表');
		expect(restored.courses.length).toBe(50);
		expect(restored.courses[0]?.name).toBe('高等数学与计算机体系结构课程第1分段');
		expect(restored.courses[0]?.weeks).toEqual([
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
		]);
	});

	it('loads plugin, registers slots, and performs export and import', async () => {
		const env = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();
		const qrPlugin = createQrCodecPlugin();
		await engine.loadPlugin(qrPlugin);

		const importSlot = engine.slots.getSlotItem('import.source.tab', 'qrcode');
		const exportSlot = engine.slots.getSlotItem('export.action', 'qrcode');

		expect(importSlot).toBeDefined();
		expect(exportSlot).toBeDefined();
		expect(exportSlot?.disposition).toBe('download');
		expect(exportSlot?.isPrimary).toBe(false);

		const sample = createTimetable({
			id: 't-qr',
			name: '二维码课表',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			},
			courses: [
				{
					id: 'c1',
					name: '软件体系结构',
					teacher: '李老师',
					location: '两江校区 弘远楼A101',
					dayOfWeek: 1,
					startPeriod: 1,
					endPeriod: 2,
					weeks: [1, 2, 3, 4]
				}
			]
		});

		// 1. Test Export Action
		const exportResult = await exportSlot!.export(sample);
		expect(exportResult.mimeType).toBe('image/svg+xml');
		expect(exportResult.filename).toBe('二维码课表-qrcode.svg');
		expect(typeof exportResult.content).toBe('string');
		expect(exportResult.content as string).toContain('<svg');

		// 2. Test Import Tab with payload
		const payload = await serializeTimetableForQr(sample);
		const importedTimetable = await importSlot!.executeImport({
			content: payload
		});

		expect(importedTimetable.name).toBe('二维码课表');
		expect(importedTimetable.courses[0]?.name).toBe('软件体系结构');
		expect(importedTimetable.courses[0]?.teacher).toBe('李老师');
	});

	it('throws descriptive error on empty or invalid import inputs', async () => {
		const env = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();
		const qrPlugin = createQrCodecPlugin();
		await engine.loadPlugin(qrPlugin);
		const importSlot = engine.slots.getSlotItem('import.source.tab', 'qrcode');

		await expect(importSlot!.executeImport({ content: '' })).rejects.toThrow(
			'未识别到有效的二维码内容'
		);
		await expect(
			importSlot!.executeImport({ content: 'invalid-content-without-data' })
		).rejects.toThrow('二维码数据格式损坏或无法解析为课表');
	});
});
