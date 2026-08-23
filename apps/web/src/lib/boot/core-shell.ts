import type { ChronosPlugin, ChronosContext } from '@chronos/core';
import { pwaInstallController } from '$lib/client/pwa-install.svelte';

export const CORE_SHELL_PLUGIN_ID = 'core-shell';

function registerCoreShellSlots(ctx: ChronosContext): void {
	ctx.registerSlot('shell.bottom-bar.tab', {
		id: 'timetable',
		label: () => '课表',
		href: '/',
		order: 10,
		icon: 'calendar-month',
		iconFill: 'calendar-month-fill'
	});

	ctx.registerSlot('shell.bottom-bar.tab', {
		id: 'mine',
		label: () => '我的',
		href: '/mine',
		order: 20,
		icon: 'person',
		iconFill: 'person-fill'
	});

	ctx.registerSlot('mine.section', {
		id: 'timetable-management',
		title: () => '课表管理',
		order: 10
	});

	ctx.registerSlot('mine.section', {
		id: 'data-sync',
		title: () => '数据与分享',
		order: 20
	});

	ctx.registerSlot('mine.section', {
		id: 'appearance-feedback',
		title: () => '个性化',
		order: 30
	});

	ctx.registerSlot('mine.section', {
		id: 'app-support',
		title: () => '应用与支持',
		order: 40
	});

	ctx.registerSlot('mine.item', {
		id: 'manage-timetables',
		sectionId: 'timetable-management',
		title: () => '管理课程表',
		href: '/manage-timetables',
		icon: 'list-alt',
		iconTone: 'primary',
		keywords: ['课表', '管理', '切换', '编辑', '课程'],
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'import',
		sectionId: 'data-sync',
		title: () => '导入课程表',
		href: '/transfer/import',
		icon: 'download',
		iconTone: 'secondary',
		keywords: ['导入', '数据', '共享', '文件', '扫码', '课表'],
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'export',
		sectionId: 'data-sync',
		title: () => '分享课程表',
		href: '/transfer/export',
		icon: 'share',
		iconTone: 'tertiary',
		keywords: ['导出', '分享', '备份', '数据', '链接', '二维码'],
		order: 20
	});

	ctx.registerSlot('mine.item', {
		id: 'display',
		sectionId: 'appearance-feedback',
		title: () => '显示设置',
		href: '/display-settings',
		icon: 'palette',
		iconTone: 'secondary',
		keywords: [
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
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'feedback',
		sectionId: 'appearance-feedback',
		title: () => '反馈设置',
		href: '/feedback-settings',
		icon: 'vibrate',
		iconTone: 'tertiary',
		keywords: ['反馈', '震动', '振动', '触感', '马达', '声音', '音效', 'haptic', 'feedback'],
		order: 20
	});

	ctx.registerSlot('mine.item', {
		id: 'plugins',
		sectionId: 'app-support',
		title: () => '插件中心',
		supporting: () => '管理官方插件与已安装扩展',
		href: '/plugins',
		icon: 'code',
		iconTone: 'secondary',
		keywords: ['插件', '官方', '扩展', 'plugin', 'official', '主题', '工具', '安装'],
		order: 5
	});

	ctx.registerSlot('mine.item', {
		id: 'install',
		sectionId: 'app-support',
		title: () => '安装 Chronos',
		supporting: () =>
			pwaInstallController.isStandalone
				? '已安装为桌面应用'
				: pwaInstallController.isInstalledLocally
					? '已安装，可在应用中打开'
					: '添加到主屏幕，快捷打开应用',
		href: '/about/install',
		icon: 'add-home',
		iconTone: 'primary',
		keywords: ['安装', 'PWA', '桌面', '应用', '主屏幕', '快捷', '下载'],
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'about',
		sectionId: 'app-support',
		title: () => '关于 Chronos',
		href: '/about',
		icon: 'info',
		iconTone: 'tertiary',
		keywords: ['关于', '版本', '开源', '协议', '许可', '开发者', '更新', '说明'],
		order: 20
	});
}

export const coreShellPlugin: ChronosPlugin = {
	id: CORE_SHELL_PLUGIN_ID,
	name: () => 'Chronos UI Core',
	version: '1.0.0',
	description: () => '核心导航与基础界面框架',
	category: 'tool',
	order: 0,
	apply(ctx) {
		registerCoreShellSlots(ctx);
	}
};
