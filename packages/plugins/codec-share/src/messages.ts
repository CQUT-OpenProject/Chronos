import { defineSchema } from '@chronos/core';

export interface ShareLinkImportForm {
	content?: string;
	fileContent?: string;
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
		'export.warning.large': '课表较大，部分应用可能截断链接内容，请注意核对导入结果',
		'import.ui.title': '分享口令',
		'import.ui.subtitle': '复制课表分享口令后点击下方按钮',
		'import.ui.loading': '读取中…',
		'import.ui.clipboard': '从剪贴板导入课表',
		'import.ui.clipboardError': '无法读取剪贴板，请检查浏览器权限',
		'share.error.corrupted': '分享链接已损坏或内容不完整',
		'share.error.unsupported': '不支持的分享链接格式',
		'share.error.parseFailed': '分享链接解析失败',
		'share.clipboard.unnamed': '未命名课表',
		'share.clipboard.template':
			'我分享了一张课表：「{name}」\n复制这段文本后，打开 Chronos，选择从【分享链接】方式导入\n{link}'
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
			'The timetable is large; some apps may truncate the link. Verify the import result.',
		'import.ui.title': 'Share link',
		'import.ui.subtitle': 'Copy a share token, then tap the button below',
		'import.ui.loading': 'Reading…',
		'import.ui.clipboard': 'Import from clipboard',
		'import.ui.clipboardError': 'Could not read clipboard. Check browser permissions',
		'share.error.corrupted': 'Share link is corrupted or incomplete',
		'share.error.unsupported': 'Unsupported share link format',
		'share.error.parseFailed': 'Failed to parse share link',
		'share.clipboard.unnamed': 'Untitled timetable',
		'share.clipboard.template':
			'I shared a timetable: "{name}"\nCopy this text, open Chronos, and import via Share link\n{link}'
	}
} as const;
