import { defineSchema } from '@chronos/core';

export function createWallpaperScreenSchema(t: (key: string) => string) {
	return defineSchema({
		wallpaper: {
			type: 'wallpaper-preview',
			title: () => t('screen.field.wallpaper.title'),
			description: () => t('screen.field.wallpaper.description'),
			accept: 'image/*',
			required: false
		}
	});
}

export const WALLPAPER_MESSAGES = {
	'zh-cn': {
		'plugin.name': '自定义壁纸',
		'plugin.description': '自定义课表页壁纸，支持动态取色',
		'theme.name': '壁纸',
		'theme.description': '从当前壁纸提取配色',
		'mine.title': '设置课表壁纸',
		'mine.keywords': '壁纸,背景,图片,自定义,封面',
		'screen.title': '设置课表壁纸',
		'screen.field.wallpaper.title': '选择壁纸图片',
		'screen.field.wallpaper.description': '支持 PNG、JPG、WebP 格式图片，自动提取并应用主题色彩',
		'screen.preview.empty': '选择壁纸后，可在此预览应用效果',
		'screen.error.tooLarge': '此图片过大，无法导入',
		'screen.error.importFailed': '壁纸导入失败，请重试',
		'screen.action.clear': '清除壁纸',
		'screen.action.repick': '重新选择',
		'screen.action.pick': '选择壁纸'
	},
	en: {
		'plugin.name': 'Custom Wallpaper',
		'plugin.description': 'Custom timetable wallpaper with dynamic color extraction',
		'theme.name': 'Wallpaper',
		'theme.description': 'Extract palette from the current wallpaper',
		'mine.title': 'Set timetable wallpaper',
		'mine.keywords': 'wallpaper,background,image,custom,cover',
		'screen.title': 'Set timetable wallpaper',
		'screen.field.wallpaper.title': 'Choose wallpaper image',
		'screen.field.wallpaper.description':
			'PNG, JPG, or WebP images with automatic theme color extraction',
		'screen.preview.empty': 'Choose a wallpaper to preview how it looks here',
		'screen.error.tooLarge': 'This image is too large to import',
		'screen.error.importFailed': 'Failed to import wallpaper. Please try again',
		'screen.action.clear': 'Remove wallpaper',
		'screen.action.repick': 'Choose again',
		'screen.action.pick': 'Choose wallpaper'
	}
} as const;
