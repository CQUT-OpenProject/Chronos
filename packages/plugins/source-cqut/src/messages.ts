import { defineSchema } from '@chronos/core';

export interface CqutImportForm {
	username?: string;
	account?: string;
	password?: string;
}

export function createCqutImportSchema(t: (key: string) => string) {
	return defineSchema<CqutImportForm>({
		username: {
			type: 'string',
			title: () => t('import.online.field.username.title'),
			placeholder: () => t('import.online.field.username.placeholder'),
			required: true
		},
		password: {
			type: 'password',
			title: () => t('import.online.field.password.title'),
			placeholder: () => t('import.online.field.password.placeholder'),
			required: true
		}
	});
}

export const SOURCE_CQUT_MESSAGES = {
	'zh-cn': {
		'plugin.name': 'CQUT-Timetable',
		'plugin.description': '从「知行理工」导入课表',
		'import.online.tab.title': '知行理工',
		'import.online.tab.supporting': '输入知行理工账号密码，获取在线课表',
		'import.online.field.username.title': '账号',
		'import.online.field.username.placeholder': '请输入工号 / 学号',
		'import.online.field.password.title': '密码',
		'import.online.field.password.placeholder': '请输入密码',
		'import.online.error.credentials': '请输入学号与密码',
		'import.online.notify.connecting': '正在连接知行理工...',
		'import.online.error.proxyUnsupported': '当前环境不支持在线教务同步',
		'import.online.error.authFailed': '教务认证失败，请检查学号与密码',
		'import.html.tab.title': '教务 HTML',
		'import.html.tab.supporting': '从教务系统导出的 HTML 课表文件导入',
		'import.html.error.invalidFile': '请选择有效的 HTML 课表文件',
		'timetable.defaultName': '重庆理工大学课表',
		'timetable.studentSuffix': '的课表'
	},
	en: {
		'plugin.name': 'CQUT Timetable',
		'plugin.description': 'Import timetables from CQUT ZhiXing',
		'import.online.tab.title': 'CQUT Online',
		'import.online.tab.supporting': 'Sign in with CQUT credentials to fetch your timetable',
		'import.online.field.username.title': 'Account',
		'import.online.field.username.placeholder': 'Student or staff ID',
		'import.online.field.password.title': 'Password',
		'import.online.field.password.placeholder': 'Enter password',
		'import.online.error.credentials': 'Enter student ID and password',
		'import.online.notify.connecting': 'Connecting to CQUT...',
		'import.online.error.proxyUnsupported':
			'Online academic sync is not available in this environment',
		'import.online.error.authFailed': 'Authentication failed. Check your credentials',
		'import.html.tab.title': 'Academic HTML',
		'import.html.tab.supporting': 'Import an HTML timetable export file',
		'import.html.error.invalidFile': 'Choose a valid HTML timetable file',
		'timetable.defaultName': 'CQUT Timetable',
		'timetable.studentSuffix': "'s timetable"
	}
} as const;
