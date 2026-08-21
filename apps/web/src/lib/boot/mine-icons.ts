import {
	AddHomeFill,
	CalendarMonth,
	CalendarMonthFill,
	DownloadFill,
	InfoFill,
	IosShareFill,
	ListAltFill,
	MobileVibrateFill,
	PaletteFill,
	Person,
	PersonFill,
	WallpaperFill,
	CodeFill
} from '$lib/icons';
import type { Component } from 'svelte';

export const BOTTOM_TAB_ICON_MAP: Record<
	string,
	{ icon: Component<{ class?: string }>; iconFill: Component<{ class?: string }> }
> = {
	timetable: { icon: CalendarMonth, iconFill: CalendarMonthFill },
	mine: { icon: Person, iconFill: PersonFill }
};

export const MINE_ITEM_ICON_MAP = {
	'list-alt': ListAltFill,
	download: DownloadFill,
	share: IosShareFill,
	palette: PaletteFill,
	vibrate: MobileVibrateFill,
	wallpaper: WallpaperFill,
	code: CodeFill,
	'add-home': AddHomeFill,
	info: InfoFill
} as const satisfies Record<string, Component<{ class?: string }>>;

export const MINE_ITEM_KEYWORDS: Record<string, string[]> = {
	'manage-timetables': ['课表', '管理', '切换', '编辑', '课程'],
	import: ['导入', '数据', '共享', '文件', '扫码', '课表'],
	export: ['导出', '分享', '备份', '数据', '链接', '二维码'],
	display: [
		'主题',
		'显示',
		'外观',
		'深色',
		'夜间',
		'亮色',
		'白天',
		'模式',
		'颜色',
		'跟随系统',
		'滚动',
		'一屏',
		'布局',
		'课表',
		'配色',
		'配色方案',
		'随机'
	],
	feedback: ['反馈', '震动', '振动', '触感', '马达', '声音', '音效', 'haptic', 'feedback'],
	wallpaper: ['壁纸', '背景', '图片', '自定义', '封面'],
	plugins: ['插件', '市场', '官方', '扩展', 'plugin', 'official', '主题', '工具', '安装'],
	install: ['安装', 'PWA', '桌面', '应用', '主屏幕', '快捷', '下载'],
	about: ['关于', '版本', '开源', '协议', '许可', '开发者', '更新', '说明']
};
