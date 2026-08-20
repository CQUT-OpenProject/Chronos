import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine, type ChronosEnv, type UserPreferences } from '@chronos/core';
import { parseHTML } from 'linkedom';
import { htmlParserPlugin, parseHtmlTimetable } from '../src/index';

function customDocParser(html: string): Document {
	const { document } = parseHTML(html);
	return document as unknown as Document;
}

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

const sampleHtml = `
<!DOCTYPE html>
<html>
<body>
<table id="kbgrid_table_0">
	<div class="timetable_title">
		<h6 class="pull-left">2024-2025学年第二学期</h6>
		王五的课表
	</div>
	<tbody>
		<tr>
			<td id="1-1" rowspan="2" class="td_wrap">
				<div class="timetable_con">
					<span class="title">线性代数</span>
					<p><span title="教师"></span>赵老师</p>
					<p><span title="上课地点"></span>二教302</p>
					<p><span title="节/周"></span>1-16周(单)</p>
				</div>
			</td>
		</tr>
	</tbody>
</table>
</body>
</html>
`;

describe('htmlParserPlugin', () => {
	it('parses educational HTML timetable structure', () => {
		const timetable = parseHtmlTimetable(sampleHtml, customDocParser);
		expect(timetable.name).toBe('王五的课表');
		expect(timetable.courses.length).toBe(1);

		const course = timetable.courses[0]!;
		expect(course.name).toBe('线性代数');
		expect(course.teacher).toBe('赵老师');
		expect(course.location).toBe('二教302');
		expect(course.dayOfWeek).toBe(1);
		expect(course.startPeriod).toBe(1);
		expect(course.endPeriod).toBe(2);
		expect(course.weeks).toEqual([1, 3, 5, 7, 9, 11, 13, 15]);
	});

	it('loads plugin and registers import.source.tab slot', async () => {
		const env = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(htmlParserPlugin);
		const sourceSlot = engine.slots.getSlotItem('import.source.tab', 'edu-html');
		expect(sourceSlot).toBeDefined();
		expect(sourceSlot?.inputSchema).toBeDefined();

		// Provide custom parser globally in test environment
		Object.defineProperty(globalThis, 'DOMParser', {
			value: class {
				parseFromString(str: string) {
					return customDocParser(str);
				}
			},
			configurable: true,
			writable: true
		});

		const ctx = engine.getPluginContext('parser-html');
		const timetable = await sourceSlot!.executeImport({ file: sampleHtml }, ctx);
		expect(timetable.name).toBe('王五的课表');

		handle.dispose();
		expect(engine.slots.getSlotItem('import.source.tab', 'edu-html')).toBeUndefined();
	});
});
