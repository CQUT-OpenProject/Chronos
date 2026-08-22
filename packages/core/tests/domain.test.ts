import { describe, it, expect } from 'vite-plus/test';
import {
	createCourse,
	COURSE_REMARK_MAX_LENGTH,
	createTimetable,
	normalizeTimetableName,
	CURRENT_TIMETABLE_SCHEMA_VERSION,
	DEFAULT_TIMETABLE_NAME,
	CURRENT_PREFERENCES_SCHEMA_VERSION,
	DEFAULT_USER_PREFERENCES
} from '../src/index';

describe('Domain Models in @chronos/core', () => {
	it('creates Course with defaults and custom metadata', () => {
		const course = createCourse({
			id: 'c1',
			name: '高等数学',
			teacher: '张老师',
			location: '花溪校区 弘远楼A101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			color: '#EADDFF'
		});

		expect(course.id).toBe('c1');
		expect(course.name).toBe('高等数学');
		expect(course.color).toBe('#EADDFF');
		expect(course.textColor).toBeUndefined();
		expect(course.weeks).toEqual([]);
		expect(course.remark).toBe('');
		expect(COURSE_REMARK_MAX_LENGTH).toBe(200);
	});

	it('assigns palette color and textColor automatically when color is omitted in createCourse', () => {
		const course = createCourse({
			id: 'c2',
			name: '大学物理',
			dayOfWeek: 2,
			startPeriod: 1,
			endPeriod: 2
		});

		expect(course.color).toBeDefined();
		expect(course.textColor).toBeDefined();
		expect(course.color?.startsWith('#')).toBe(true);
		expect(course.textColor?.startsWith('#')).toBe(true);
	});

	it('normalizes timetable name', () => {
		expect(normalizeTimetableName('  ')).toBe(DEFAULT_TIMETABLE_NAME);
		expect(normalizeTimetableName(' 2026春课表 ')).toBe('2026春课表');
	});

	it('creates Timetable with schemaVersion 1 and customMetadata support', () => {
		const timetable = createTimetable({
			id: 't1',
			name: '我的课表',
			customMetadata: {
				'source-cqut': { campusId: 'huaxi' }
			}
		});

		expect(timetable.schemaVersion).toBe(CURRENT_TIMETABLE_SCHEMA_VERSION);
		expect(timetable.schemaVersion).toBe(1);
		expect(timetable.id).toBe('t1');
		expect(timetable.name).toBe('我的课表');
		expect(timetable.academicConfig.startWeek).toBe(1);
		expect(timetable.academicConfig.endWeek).toBe(20);
		expect(timetable.viewPrefs.showSaturday).toBe(true);
		expect(timetable.viewPrefs.showSunday).toBe(true);
		expect(timetable.viewPrefs.showNonCurrentWeekCourses).toBe(false);
		expect(timetable.customMetadata?.['source-cqut']).toEqual({ campusId: 'huaxi' });
	});

	it('provides valid default UserPreferences', () => {
		expect(DEFAULT_USER_PREFERENCES.schemaVersion).toBe(CURRENT_PREFERENCES_SCHEMA_VERSION);
		expect(DEFAULT_USER_PREFERENCES.schemaVersion).toBe(2);
		expect(DEFAULT_USER_PREFERENCES.themeMode).toBe('auto');
		expect(DEFAULT_USER_PREFERENCES.paletteMode).toBe('vibrant');
		expect(DEFAULT_USER_PREFERENCES.timetableLayoutMode).toBe('fixed');
		expect(DEFAULT_USER_PREFERENCES.capsuleCornerStyle).toBe('rounded');
		expect(DEFAULT_USER_PREFERENCES.hapticFeedbackEnabled).toBe(true);
		expect(DEFAULT_USER_PREFERENCES.visualIconThemeId).toBe('host-default');
	});
});
