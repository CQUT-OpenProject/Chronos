import type { ChronosEngine } from '@chronos/core';
import { pwaInstallController } from '$lib/client/pwa-install.svelte';

export const CORE_SHELL_PLUGIN_ID = 'core-shell';

export function registerCoreShellSlots(engine: ChronosEngine): void {
	engine.slots.register('shell.bottom-bar.tab', {
		id: 'timetable',
		label: () => '课表',
		href: '/',
		order: 10
	});

	engine.slots.register('shell.bottom-bar.tab', {
		id: 'mine',
		label: () => '我的',
		href: '/mine',
		order: 20
	});

	engine.slots.register('mine.section', {
		id: 'timetable-management',
		title: () => '课表管理',
		order: 10
	});

	engine.slots.register('mine.section', {
		id: 'data-sync',
		title: () => '数据与分享',
		order: 20
	});

	engine.slots.register('mine.section', {
		id: 'appearance-feedback',
		title: () => '个性化',
		order: 30
	});

	engine.slots.register('mine.section', {
		id: 'app-support',
		title: () => '应用与支持',
		order: 40
	});

	engine.slots.register('mine.item', {
		id: 'manage-timetables',
		sectionId: 'timetable-management',
		title: () => '管理课程表',
		href: '/manage-timetables',
		icon: 'list-alt',
		iconTone: 'primary',
		order: 10
	});

	engine.slots.register('mine.item', {
		id: 'import',
		sectionId: 'data-sync',
		title: () => '导入课程表',
		href: '/transfer/import',
		icon: 'download',
		iconTone: 'secondary',
		order: 10
	});

	engine.slots.register('mine.item', {
		id: 'export',
		sectionId: 'data-sync',
		title: () => '分享课程表',
		href: '/transfer/export',
		icon: 'share',
		iconTone: 'tertiary',
		order: 20
	});

	engine.slots.register('mine.item', {
		id: 'display',
		sectionId: 'appearance-feedback',
		title: () => '显示设置',
		href: '/display-settings',
		icon: 'palette',
		iconTone: 'secondary',
		order: 10
	});

	engine.slots.register('mine.item', {
		id: 'feedback',
		sectionId: 'appearance-feedback',
		title: () => '反馈设置',
		href: '/feedback-settings',
		icon: 'vibrate',
		iconTone: 'tertiary',
		order: 20
	});

	engine.slots.register('mine.item', {
		id: 'wallpaper',
		sectionId: 'appearance-feedback',
		title: () => '设置课表壁纸',
		href: '/wallpaper',
		icon: 'wallpaper',
		iconTone: 'primary',
		order: 30
	});

	engine.slots.register('mine.item', {
		id: 'plugins',
		sectionId: 'app-support',
		title: () => '插件中心',
		supporting: () => '管理已安装插件与在线市场',
		href: '/plugins',
		icon: 'code',
		iconTone: 'secondary',
		order: 5
	});

	engine.slots.register('mine.item', {
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
		order: 10
	});

	engine.slots.register('mine.item', {
		id: 'about',
		sectionId: 'app-support',
		title: () => '关于 Chronos',
		href: '/about',
		icon: 'info',
		iconTone: 'tertiary',
		order: 20
	});
}
