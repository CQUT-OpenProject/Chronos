import { defineSchema } from '@chronos/core';

export interface QrCodeImportForm {
	content?: string;
}

export function createQrCodeImportSchema(t: (key: string) => string) {
	return defineSchema<QrCodeImportForm>({
		content: {
			type: 'string',
			title: () => t('import.field.content.title'),
			placeholder: () => t('import.field.content.placeholder'),
			required: true
		}
	});
}

export const QR_CODEC_MESSAGES = {
	'zh-cn': {
		'plugin.name': '二维码',
		'plugin.description': '通过二维码导入/导出课表',
		'import.tab.title': '二维码',
		'import.tab.badge': '图片',
		'import.tab.supporting': '选择或扫描导出为二维码图片进行导入',
		'import.field.content.title': '二维码内容',
		'import.field.content.placeholder': '二维码识别出的数据内容',
		'import.error.empty': '未识别到有效的二维码内容',
		'import.error.corrupt': '二维码数据格式损坏或无法解析为课表',
		'import.error.decodeFailed': '二维码识别失败',
		'import.ui.title': '二维码',
		'import.ui.subtitle': '选择或拖入他人分享的导出为二维码图片',
		'import.ui.dropLabel': '点击选择二维码图片',
		'import.ui.formats': '支持 PNG、JPEG、WebP 或 SVG 格式',
		'import.ui.select': '选择图片',
		'import.ui.scanning': '识别中…',
		'import.ui.dropAria': '二维码图片上传区域',
		'export.action.title': '二维码',
		'export.action.description': '生成分享二维码 PNG 图片并保存',
		'export.error.noTimetable': '无可导出的课表',
		'export.success': '已生成并下载导出为二维码',
		'timetable.unnamedCourse': '未命名课程',
		'timetable.defaultName': '二维码导入课表',
		'decode.browserOnly': '二维码解码仅支持在浏览器环境中运行',
		'decode.unreadableImage': '无法读取图片内容',
		'decode.noQrFound': '未能从该图片中识别出有效的二维码或当前浏览器不支持原生扫码识别'
	},
	en: {
		'plugin.name': 'QR Code',
		'plugin.description': 'Import and export timetables via QR codes',
		'import.tab.title': 'QR code',
		'import.tab.badge': 'Image',
		'import.tab.supporting': 'Select or scan a timetable QR code image to import',
		'import.field.content.title': 'QR content',
		'import.field.content.placeholder': 'Decoded QR payload',
		'import.error.empty': 'No valid QR content was recognized',
		'import.error.corrupt': 'QR data is corrupted or cannot be parsed as a timetable',
		'import.error.decodeFailed': 'Failed to decode QR code',
		'import.ui.title': 'QR code',
		'import.ui.subtitle': 'Select or drop a shared timetable QR image',
		'import.ui.dropLabel': 'Choose a QR image',
		'import.ui.formats': 'PNG, JPEG, WebP, or SVG',
		'import.ui.select': 'Choose image',
		'import.ui.scanning': 'Scanning…',
		'import.ui.dropAria': 'QR image upload area',
		'export.action.title': 'QR code',
		'export.action.description': 'Generate a shareable QR PNG image and download',
		'export.error.noTimetable': 'No timetable to export',
		'export.success': 'Timetable QR code downloaded',
		'timetable.unnamedCourse': 'Untitled course',
		'timetable.defaultName': 'Imported timetable (QR)',
		'decode.browserOnly': 'QR decoding is only available in the browser',
		'decode.unreadableImage': 'Could not read image contents',
		'decode.noQrFound':
			'No valid QR code was found in this image, or the browser does not support native scanning'
	}
} as const;

export type QrCodecLabels = Record<keyof (typeof QR_CODEC_MESSAGES)['zh-cn'], string>;

export function qrCodecLabels(locale: string): QrCodecLabels {
	const normalized = locale.toLowerCase() === 'en' ? 'en' : 'zh-cn';
	return QR_CODEC_MESSAGES[normalized] as QrCodecLabels;
}
