import { describe, expect, it } from 'vite-plus/test';
import {
	timetableDayLabel,
	timetableDayShortLabel,
	type HostDayLabelTranslate
} from '../src/timetable-preview/day-labels';

const zhCnLabels: Record<string, string> = {
	'timetable.day.mon': '周一',
	'timetable.day.sun': '周日',
	'timetable.day.unknown': '未知',
	'timetable.dayShort.wed': '三'
};

const t: HostDayLabelTranslate = (key) => zhCnLabels[key] ?? key;

describe('day-labels', () => {
	it('maps day of week using host translate keys', () => {
		expect(timetableDayLabel(1, t)).toBe('周一');
		expect(timetableDayLabel(7, t)).toBe('周日');
		expect(timetableDayLabel(0, t)).toBe('');
		expect(timetableDayLabel(99, t)).toBe('未知');
		expect(timetableDayShortLabel(3, t)).toBe('三');
		expect(timetableDayShortLabel(99, t)).toBe('?');
	});
});
