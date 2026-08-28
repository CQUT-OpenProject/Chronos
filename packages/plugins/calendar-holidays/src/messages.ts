import type { PluginMessageCatalog } from '@chronos/core';

export const HOLIDAY_MESSAGES = {
	'zh-cn': {
		'plugin.name': '法定节假日',
		'plugin.description': '在课表中展示法定节假日',
		'mine.title': '法定节假日',
		'mine.keywords': '节假日,假期,放假,国庆,春节,holiday',
		'screen.title': '法定节假日',
		'screen.intro.title': '法定节假日',
		'screen.intro.body':
			'安装后自动同步国务院公布的放假安排，并在课表标注。仅标记放假，不包含调休补班。',
		'screen.intro.source': '数据来源：holiday-cn',
		'screen.sync.title': '同步法定节假日',
		'screen.sync.years': '将同步 {years} 年数据',
		'screen.sync.action': '同步法定节假日',
		'screen.sync.resync': '重新同步',
		'screen.sync.syncing': '同步中…',
		'screen.sync.last': '上次同步：{time} · 来源 holiday-cn',
		'screen.sync.never': '尚未同步',
		'screen.list.heading': '本学期假期',
		'screen.list.empty': '本学期暂无法定节假日',
		'screen.list.emptyHint': '同步后，课表将标注法定放假日',
		'screen.error.noTimetable': '请先选择或创建课表',
		'screen.error.syncFailed': '同步失败，请检查网络后重试',
		'screen.notify.synced': '法定节假日已同步'
	},
	en: {
		'plugin.name': 'Public Holidays',
		'plugin.description': 'Show public holidays on the timetable',
		'mine.title': 'Public Holidays',
		'mine.keywords': 'holiday,vacation,national day,spring festival',
		'screen.title': 'Public Holidays',
		'screen.intro.title': 'Public Holidays',
		'screen.intro.body':
			'Automatically syncs official public holiday schedules on install and marks them on your timetable. Only rest days are marked; makeup workdays are excluded.',
		'screen.intro.source': 'Data source: holiday-cn',
		'screen.sync.title': 'Sync public holidays',
		'screen.sync.years': 'Will sync years: {years}',
		'screen.sync.action': 'Sync public holidays',
		'screen.sync.resync': 'Resync',
		'screen.sync.syncing': 'Syncing…',
		'screen.sync.last': 'Last sync: {time} · source holiday-cn',
		'screen.sync.never': 'Not synced yet',
		'screen.list.heading': 'Holidays this term',
		'screen.list.empty': 'No public holidays in this term',
		'screen.list.emptyHint': 'After syncing, holidays will appear on your timetable',
		'screen.error.noTimetable': 'Select or create a timetable first',
		'screen.error.syncFailed': 'Sync failed. Check your network and try again.',
		'screen.notify.synced': 'Public holidays synced'
	}
} satisfies PluginMessageCatalog;
