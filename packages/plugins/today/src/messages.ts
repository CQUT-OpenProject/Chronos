import { defineSchema, type ConfigSchema, type PluginMessageCatalog } from '@chronos/core';
import { DEFAULT_PREPARE_REMINDER_MINUTES, type TodayPluginConfig } from './constants';

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
		'screen.status.preparing': '准备上课',
		'screen.status.past': '已结束',
		'screen.status.upcoming': '未开始',
		'screen.course.location': '教室 {location}',
		'screen.course.teacher': '教师 {teacher}',
		'screen.course.timetable': '{name}',
		'screen.course.periodSingle': '第 {n} 节',
		'screen.course.periodRange': '第 {start}-{end} 节',
		'config.scope.title': '范围',
		'config.prepareReminderMinutes.title': '课前提醒',
		'config.prepareReminderMinutes.description': '开课前多少分钟显示「准备上课」提示，设为 0 关闭',
		'config.prepareReminderMinutes.invalid': '提醒时间不能小于 0'
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
		'screen.status.preparing': 'Get ready',
		'screen.status.past': 'Ended',
		'screen.status.upcoming': 'Upcoming',
		'screen.course.location': 'Room {location}',
		'screen.course.teacher': 'Teacher {teacher}',
		'screen.course.timetable': '{name}',
		'screen.course.periodSingle': 'Period {n}',
		'screen.course.periodRange': 'Periods {start}-{end}',
		'config.scope.title': 'Scope',
		'config.prepareReminderMinutes.title': 'Class reminder',
		'config.prepareReminderMinutes.description':
			'Show a "Get ready" prompt this many minutes before class. Set to 0 to disable.',
		'config.prepareReminderMinutes.invalid': 'Reminder time cannot be negative'
	}
} satisfies PluginMessageCatalog;

export const TODAY_CONFIG_SCHEMA = defineSchema({
	prepareReminderMinutes: {
		type: 'number',
		title: {
			'zh-cn': TODAY_MESSAGES['zh-cn']['config.prepareReminderMinutes.title'],
			en: TODAY_MESSAGES.en['config.prepareReminderMinutes.title']
		},
		description: {
			'zh-cn': TODAY_MESSAGES['zh-cn']['config.prepareReminderMinutes.description'],
			en: TODAY_MESSAGES.en['config.prepareReminderMinutes.description']
		},
		default: DEFAULT_PREPARE_REMINDER_MINUTES,
		validate: (value) =>
			value < 0 ? TODAY_MESSAGES['zh-cn']['config.prepareReminderMinutes.invalid'] : null
	}
}) as ConfigSchema<Pick<TodayPluginConfig, 'prepareReminderMinutes'>>;
