import { describe, it, expect } from 'vite-plus/test';
import * as Core from '../src/index';

describe('@chronos/core ECMAScript Purity', () => {
	it('exports all expected core domain, engine, schema, and runtime modules', () => {
		expect(Core.createCourse).toBeTypeOf('function');
		expect(Core.createTimetable).toBeTypeOf('function');
		expect(Core.AcademicCalendarService).toBeTypeOf('function');
		expect(Core.placeCapsules).toBeTypeOf('function');
		expect(Core.parseIsoDate).toBeTypeOf('function');
		expect(Core.calculateTimetableGrid).toBeTypeOf('function');
		expect(Core.buildTimetableCourseDisplayModels).toBeTypeOf('function');
		expect(Core.COURSE_PALETTE_ENTRIES).toBeInstanceOf(Array);
		expect(Core.EventBus).toBeTypeOf('function');
		expect(Core.Pipeline).toBeTypeOf('function');
		expect(Core.SlotRegistry).toBeTypeOf('function');
		expect(Core.HierarchicalSlotRegistry).toBeTypeOf('function');
		expect(Core.ServiceContainer).toBeTypeOf('function');
		expect(Core.createServiceIdentifier).toBeTypeOf('function');
		expect(Core.defineSchema).toBeTypeOf('function');
		expect(Core.validateSchema).toBeTypeOf('function');
		expect(Core.extractDefaultValues).toBeTypeOf('function');
		expect(Core.ThemeRegistry).toBeTypeOf('function');
		expect(Core.BadgeManager).toBeTypeOf('function');
		expect(Core.ScopedContext).toBeTypeOf('function');
		expect(Core.ChronosEngine).toBeTypeOf('function');
	});

	it('operates purely on standard ECMAScript data types without DOM globals', () => {
		// Verify that all core algorithms work even if DOM globals are undefined
		const course = Core.createCourse({
			id: 'c1',
			name: '计算机网络',
			teacher: '王老师',
			location: '花溪校区 弘远楼B204',
			dayOfWeek: 2,
			startPeriod: 3,
			endPeriod: 4,
			weeks: [1, 2, 3]
		});

		const timetable = Core.createTimetable({
			id: 't1',
			name: '计算机学院课表',
			courses: [course]
		});

		const grid = Core.calculateTimetableGrid('2026-03-03', 1, timetable);
		expect(grid.visibleDays.length).toBe(7);

		const displayModels = Core.buildTimetableCourseDisplayModels(
			timetable,
			new Set([1, 2, 3, 4, 5, 6, 7]),
			1
		);
		expect(displayModels.length).toBe(1);

		const capsules = Core.placeCapsules({
			courseDisplayModels: displayModels,
			visibleDays: grid.visibleDays,
			columnWidthPx: 80,
			expandedSlotKeys: new Set()
		});
		expect(capsules.length).toBe(1);
	});
});
