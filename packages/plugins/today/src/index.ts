import { defineChronosPlugin } from '@chronos/core';
import type { ChronosMountable } from '@chronos/core';
import { TODAY_MESSAGES } from './messages';
import { TODAY_PLUGIN_ID, type TodayScope } from './constants';

export interface TodayPluginConfig {
	scope: TodayScope;
}

export interface CreateTodayPluginOptions {
	screenComponent?: ChronosMountable;
}

export function createTodayPlugin(options: CreateTodayPluginOptions = {}) {
	const { screenComponent } = options;

	return defineChronosPlugin<TodayPluginConfig>({
		id: TODAY_PLUGIN_ID,
		messages: TODAY_MESSAGES,
		nameKey: 'plugin.name',
		descriptionKey: 'plugin.description',
		category: 'tool',
		order: 35,
		author: 'Chronos',
		defaultConfig: { scope: 'active' },
		async apply(ctx, t) {
			ctx.registerSlot('shell.bottom-bar.tab', {
				id: 'today',
				label: () => t('tab.label'),
				order: 15,
				icon: 'today',
				iconFill: 'calendar-today',
				defaultLaunch: true
			});

			ctx.registerSlot('shell.route.screen', {
				id: TODAY_PLUGIN_ID,
				title: () => t('screen.title'),
				...(screenComponent ? { component: screenComponent } : {})
			});
		}
	});
}

export { TODAY_PLUGIN_ID } from './constants';
