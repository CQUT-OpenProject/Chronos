import { defineSchema } from '@chronos/core';

export interface ShareLinkImportForm {
	content?: string;
}

export function createShareLinkImportSchema(t: (key: string) => string) {
	return defineSchema<ShareLinkImportForm>({
		content: {
			type: 'string',
			title: () => t('import.field.content.title'),
			placeholder: () => t('import.field.content.placeholder'),
			required: true
		}
	});
}

export const SHARE_CODEC_MESSAGES = {
	'zh-cn': {
		'plugin.name': '分享编解码',
		'plugin.description': '课表分享短链编解码',
		'import.tab.title': '分享口令',
		'import.field.content.title': '分享链接或口令',
		'import.field.content.placeholder': '粘贴课表分享链接或完整口令',
		'import.error.empty': '未识别到有效的课表分享链接',
		'export.action.title': '分享口令',
		'export.action.description': '生成紧凑分享口令并复制到剪贴板',
		'export.success': '已复制课表链接',
		'export.warning.large': '课表较大，部分应用可能截断链接内容，请注意核对导入结果'
	},
	en: {
		'plugin.name': 'Share Codec',
		'plugin.description': 'Timetable share link codec',
		'import.tab.title': 'Share link',
		'import.field.content.title': 'Share link or token',
		'import.field.content.placeholder': 'Paste a timetable share link or full token',
		'import.error.empty': 'No valid timetable share link was recognized',
		'export.action.title': 'Share link',
		'export.action.description': 'Generate a compact share token and copy to clipboard',
		'export.success': 'Timetable link copied',
		'export.warning.large':
			'The timetable is large; some apps may truncate the link. Verify the import result.'
	}
} as const;
