import type { ChronosContext } from '@chronos/core';
import { DEFAULT_MINE_SECTION_ID, defineChronosPlugin, type PluginTranslate } from '@chronos/core';
import { pwaInstallController } from '$lib/client/pwa-install.svelte';
import { CORE_SHELL_MESSAGES } from '$lib/boot/core-shell-messages';

const CORE_SHELL_PLUGIN_ID = 'core-shell';

function keywordList(t: PluginTranslate, key: string): string[] {
	return t(key)
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean);
}

function registerCoreShellSlots(ctx: ChronosContext, t: PluginTranslate): void {
	ctx.registerSlot('shell.bottom-bar.tab', {
		id: 'timetable',
		label: () => t('tab.timetable'),
		order: 10,
		icon: 'calendar-month',
		iconFill: 'calendar-month-fill',
		hostPanel: 'timetable'
	});

	ctx.registerSlot('shell.bottom-bar.tab', {
		id: 'mine',
		label: () => t('tab.mine'),
		order: 20,
		icon: 'person',
		iconFill: 'person-fill',
		hostPanel: 'mine'
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
		id: DEFAULT_MINE_SECTION_ID,
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
		keywords: keywordList(t, 'item.manage-timetables.keywords'),
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'import',
		sectionId: 'data-sync',
		title: () => t('item.import'),
		href: '/transfer/import',
		icon: 'download',
		iconTone: 'secondary',
		keywords: keywordList(t, 'item.import.keywords'),
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'export',
		sectionId: 'data-sync',
		title: () => t('item.export'),
		href: '/transfer/export',
		icon: 'share',
		iconTone: 'tertiary',
		keywords: keywordList(t, 'item.export.keywords'),
		order: 20
	});

	ctx.registerSlot('mine.item', {
		id: 'display',
		sectionId: 'appearance-feedback',
		title: () => t('item.display'),
		href: '/display-settings',
		icon: 'palette',
		iconTone: 'secondary',
		keywords: keywordList(t, 'item.display.keywords'),
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'feedback',
		sectionId: 'appearance-feedback',
		title: () => t('item.feedback'),
		href: '/feedback-settings',
		icon: 'vibrate',
		iconTone: 'tertiary',
		keywords: keywordList(t, 'item.feedback.keywords'),
		order: 20
	});

	ctx.registerSlot('mine.item', {
		id: 'plugins',
		sectionId: DEFAULT_MINE_SECTION_ID,
		title: () => t('item.plugins'),
		supporting: () => t('item.plugins.supporting'),
		href: '/plugins',
		icon: 'code',
		iconTone: 'secondary',
		keywords: keywordList(t, 'item.plugins.keywords'),
		order: 5
	});

	ctx.registerSlot('mine.item', {
		id: 'install',
		sectionId: DEFAULT_MINE_SECTION_ID,
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
		keywords: keywordList(t, 'item.install.keywords'),
		order: 10
	});

	ctx.registerSlot('mine.item', {
		id: 'about',
		sectionId: DEFAULT_MINE_SECTION_ID,
		title: () => t('item.about'),
		href: '/about',
		icon: 'info',
		iconTone: 'tertiary',
		keywords: keywordList(t, 'item.about.keywords'),
		order: 20
	});
}

export const coreShellPlugin = defineChronosPlugin({
	id: CORE_SHELL_PLUGIN_ID,
	messages: CORE_SHELL_MESSAGES,
	nameKey: 'plugin.name',
	descriptionKey: 'plugin.description',
	version: 'builtin',
	category: 'tool',
	order: 0,
	apply(ctx, t) {
		registerCoreShellSlots(ctx, t);
	}
});
