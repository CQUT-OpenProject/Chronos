import './test-setup';
import { describe, expect, it } from 'vite-plus/test';
import { EducationalTimetableHtmlParser } from './educational-timetable-html-parser';
import type { TimeProvider } from '$lib/domain/services/time-provider';

const fixedTimeProvider: TimeProvider = {
	today: () => '2026-03-04',
	currentTime: () => '09:00',
	currentTimeMillis: () => 100
};

describe('EducationalTimetableHtmlParser', () => {
	const parser = new EducationalTimetableHtmlParser(undefined, fixedTimeProvider);

	it('parse extracts timetable and view prefs from educational html', () => {
		const result = parser.parse(`
			<table id="kbgrid_table_0">
			  <tbody>
			    <tr>
			      <td colspan="9">
			        <div class="timetable_title">
			          <h6 class="pull-left">2025-2026学年第2学期</h6>
			          陈炜堂的课表
			        </div>
			      </td>
			    </tr>
			    <tr>
			      <td class="td_wrap" id="6-1" rowspan="2">
			        <div class="timetable_con">
			          <div class="title">编译原理</div>
			          <p><span title="教师">教师</span> 张老师</p>
			          <p><span title="上课地点">地点</span> B201</p>
			          <p><span title="节/周">节/周</span> 1-16周</p>
			        </div>
			      </td>
			    </tr>
			  </tbody>
			</table>
		`);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value?.name).toBe('陈炜堂的课表');
		expect(result.value?.academicConfig.termStartDate).toBe('2026-03-02');
		expect(result.value?.viewPrefs.showSaturday).toBe(true);
		expect(result.value?.viewPrefs.showSunday).toBe(false);
		expect(result.value?.courses[0]?.name).toBe('编译原理');
	});

	it('parse returns null when no educational timetable table exists', () => {
		const result = parser.parse('<html></html>');
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.value).toBeNull();
	});
});
