import type { ChronosPlugin, ChronosContext } from '@chronos/core';
import { pwaInstallController } from '$lib/client/pwa-install.svelte';
import { CORE_SHELL_MESSAGES } from '$lib/boot/core-shell-messages';

const CORE_SHELL_PLUGIN_ID = 'core-shell';
export const CORE_SHELL_SUPPORT_SECTION_ID = 'app-support';

function registerCoreShellSlots(ctx: ChronosContext, t: (key: string) => string): void {
	ctx.registerSlot('shell.bottom-bar.tab', {
		id: 'timetable',
		label: () => t('tab.timetable'),
		href: '/',
		order: 10,
		icon: 'calendar-month',
		iconFill: 'calendar-month-fill'
	});

	ctx.registerSlot('shell.bottom-bar.tab', {
		id: 'mine',
		label: () => t('tab.mine'),
		href: '/mine',
		order: 20,
		icon: 'person',
		iconFill: 'person-fill'
	});

	ctx.registerSlot('mine.section', {
		id: 'timetable-management',
		title: () => t('section.timetable-management'),
		order: 10
	});

	ctx.registerSlot('mine.section', {
		id: 'data-sync',
		title: () => t('section.data-sync'),
		order: 20
	});

	ctx.registerSlot('mine.section', {
		id: 'appearance-feedback',
		title: () => t('section.appearance-feedback'),
		order: 30
	});

	ctx.registerSlot('mine.section', {
		id: CORE_SHELL_SUPPORT_SECTION_ID,
		title: () => t('section.app-support'),
		order: 40
	});

	ctx.registerSlot('mine.item', {
		id: 'manage-timetables',
		sectionId: 'timetable-management',
		title: () => t('item.manage-timetables'),
		href: '/manage-timetables',
		icon: 'list-alt',
		iconTone: 'primary',
		keywords: ['课表', '管理', '切换', '编辑', '课程'],
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'import',
		sectionId: 'data-sync',
		title: () => t('item.import'),
		href: '/transfer/import',
		icon: 'download',
		iconTone: 'secondary',
		keywords: ['导入', '数据', '共享', '文件', '扫码', '课表'],
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'export',
		sectionId: 'data-sync',
		title: () => t('item.export'),
		href: '/transfer/export',
		icon: 'share',
		iconTone: 'tertiary',
		keywords: ['导出', '分享', '备份', '数据', '链接', '二维码'],
		order: 20
	});

	ctx.registerSlot('mine.item', {
		id: 'display',
		sectionId: 'appearance-feedback',
		title: () => t('item.display'),
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
		title: () => t('item.feedback'),
		href: '/feedback-settings',
		icon: 'vibrate',
		iconTone: 'tertiary',
		keywords: ['反馈', '震动', '振动', '触感', '马达', '声音', '音效', 'haptic', 'feedback'],
		order: 20
	});

	ctx.registerSlot('mine.item', {
		id: 'plugins',
		sectionId: CORE_SHELL_SUPPORT_SECTION_ID,
		title: () => t('item.plugins'),
		supporting: () => t('item.plugins.supporting'),
		href: '/plugins',
		icon: 'code',
		iconTone: 'secondary',
		keywords: ['插件', '官方', '扩展', 'plugin', 'official', '主题', '工具', '安装'],
		order: 5
	});

	ctx.registerSlot('mine.item', {
		id: 'install',
		sectionId: CORE_SHELL_SUPPORT_SECTION_ID,
		title: () => t('item.install'),
		supporting: () =>
			pwaInstallController.isStandalone
				? t('item.install.supporting.standalone')
				: pwaInstallController.isInstalledLocally
					? t('item.install.supporting.local')
					: t('item.install.supporting.prompt'),
		href: '/about/install',
		icon: 'add-home',
		iconTone: 'primary',
		keywords: ['安装', 'PWA', '桌面', '应用', '主屏幕', '快捷', '下载'],
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'about',
		sectionId: CORE_SHELL_SUPPORT_SECTION_ID,
		title: () => t('item.about'),
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
		ctx.i18n.registerMessages(CORE_SHELL_MESSAGES);
		registerCoreShellSlots(ctx, (key) => ctx.i18n.t(key));
	}
};
