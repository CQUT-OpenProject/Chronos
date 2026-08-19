import { describe, it, expect, vi } from 'vite-plus/test';
import { SlotRegistry } from '../src/runtime/slot-registry';
import { createTimetable, type Timetable } from '../src/domain/timetable';
import type {
	CourseActionContribution,
	TimetableExporterAdapter,
	TimetableSourceAdapter
} from '../src/types/contributions';

describe('SlotRegistry in @chronos/core', () => {
	it('registers and retrieves source adapters and triggers slot change callback', () => {
		const onSlotChange = vi.fn();
		const registry = new SlotRegistry(onSlotChange);

		const source: TimetableSourceAdapter = {
			id: 'cqut',
			title: 'CQUT 教务',
			authType: 'password',
			fetchSchedule: async () => createTimetable({ id: 't1', name: 'CQUT' })
		};

		const sub = registry.registerSource(source);
		expect(onSlotChange).toHaveBeenCalledTimes(1);
		expect(registry.getSource('cqut')).toBe(source);
		expect(registry.getSources()).toEqual([source]);

		sub.dispose();
		expect(onSlotChange).toHaveBeenCalledTimes(2);
		expect(registry.getSource('cqut')).toBeUndefined();
		expect(registry.getSources()).toEqual([]);
	});

	it('registers and retrieves exporter adapters', () => {
		const registry = new SlotRegistry();

		const exporter: TimetableExporterAdapter = {
			id: 'ics',
			title: '日历导出',
			export: async (_tt: Timetable) => ({
				filename: 'schedule.ics',
				mimeType: 'text/calendar',
				content: 'BEGIN:VCALENDAR'
			})
		};

		const sub = registry.registerExporter(exporter);
		expect(registry.getExporter('ics')).toBe(exporter);
		expect(registry.getExporters()).toEqual([exporter]);

		sub.dispose();
		expect(registry.getExporter('ics')).toBeUndefined();
		expect(registry.getExporters()).toEqual([]);
	});

	it('registers and retrieves course action contributions', () => {
		const registry = new SlotRegistry();

		const action: CourseActionContribution = {
			id: 'add-note',
			label: '添加笔记',
			onExecute: vi.fn()
		};

		const sub = registry.registerCourseAction(action);
		expect(registry.getCourseAction('add-note')).toBe(action);
		expect(registry.getCourseActions()).toEqual([action]);

		sub.dispose();
		expect(registry.getCourseAction('add-note')).toBeUndefined();
		expect(registry.getCourseActions()).toEqual([]);
	});
});
