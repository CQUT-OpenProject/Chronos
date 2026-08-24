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
		'import.online.offline': '当前处于离线模式，无法连接知行理工',
		'import.online.intro': '请输入知行理工账号密码以获取在线课表。',
		'import.online.accountLabel': '工号 / 学号',
		'import.online.password.hide': '隐藏密码',
		'import.online.password.show': '显示密码',
		'import.online.submit.loading': '获取中…',
		'import.online.submit': '从此账号导入课表',
		'import.html.intro': '选择教务系统导出的 HTML 课表文件。',
		'import.html.campusLabel': '校区',
		'import.html.campus.liangjiang': '两江校区',
		'import.html.campus.huaxi': '花溪校区',
		'import.html.submit.loading': '解析中…',
		'import.html.submit': '选择 HTML 文件',
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
		'import.online.offline': 'You are offline and cannot connect to CQUT',
		'import.online.intro': 'Enter your CQUT credentials to fetch your online timetable.',
		'import.online.accountLabel': 'Student or staff ID',
		'import.online.password.hide': 'Hide password',
		'import.online.password.show': 'Show password',
		'import.online.submit.loading': 'Fetching…',
		'import.online.submit': 'Import from this account',
		'import.html.intro': 'Choose an HTML timetable file exported from the academic system.',
		'import.html.campusLabel': 'Campus',
		'import.html.campus.liangjiang': 'Liangjiang campus',
		'import.html.campus.huaxi': 'Huaxi campus',
		'import.html.submit.loading': 'Parsing…',
		'import.html.submit': 'Choose HTML file',
		'timetable.defaultName': 'CQUT Timetable',
		'timetable.studentSuffix': "'s timetable"
	}
} as const;
