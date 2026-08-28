import type { PluginMessageCatalog } from '@chronos/core';

export const TODAY_MESSAGES = {
	'zh-cn': {
		'plugin.name': '今日',
		'plugin.description': '快速查看当天课程',
		'tab.label': '今日',
		'screen.title': '今日',
		'screen.week': '第 {week} 周',
		'screen.scope.active': '当前课表',
		'screen.scope.all': '全部课表',
		'screen.summary.count': '共 {count} 节课',
		'screen.summary.current': '第 {period} 节进行中',
		'screen.empty.noTimetable': '请先选择或创建课表',
		'screen.empty.noCourses': '今天没有课',
		'screen.empty.noCoursesHint': '享受轻松的一天吧',
		'screen.status.current': '进行中',
		'screen.status.past': '已结束',
		'screen.status.upcoming': '未开始',
		'screen.course.location': '教室 {location}',
		'screen.course.teacher': '教师 {teacher}',
		'screen.course.timetable': '{name}',
		'screen.course.periodSingle': '第 {n} 节',
		'screen.course.periodRange': '第 {start}-{end} 节'
	},
	en: {
		'plugin.name': 'Today',
		'plugin.description': "Quick showing today's courses",
		'tab.label': 'Today',
		'screen.title': 'Today',
		'screen.week': 'Week {week}',
		'screen.scope.active': 'Current timetable',
		'screen.scope.all': 'All timetables',
		'screen.summary.count': '{count} course(s) today',
		'screen.summary.current': 'Period {period} in progress',
		'screen.empty.noTimetable': 'Select or create a timetable first',
		'screen.empty.noCourses': 'No classes today',
		'screen.empty.noCoursesHint': 'Enjoy your day off',
		'screen.status.current': 'Now',
		'screen.status.past': 'Ended',
		'screen.status.upcoming': 'Upcoming',
		'screen.course.location': 'Room {location}',
		'screen.course.teacher': 'Teacher {teacher}',
		'screen.course.timetable': '{name}',
		'screen.course.periodSingle': 'Period {n}',
		'screen.course.periodRange': 'Periods {start}-{end}'
	}
} satisfies PluginMessageCatalog;
