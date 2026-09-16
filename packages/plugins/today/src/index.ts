import { defineChronosPlugin, type ConfigSchema } from '@chronos/core';
import type { ChronosMountable } from '@chronos/core';
import { TODAY_CONFIG_SCHEMA, TODAY_MESSAGES } from './messages';
import {
	DEFAULT_PREPARE_REMINDER_MINUTES,
	TODAY_PLUGIN_ID,
	type TodayPluginConfig
} from './constants';

export type { TodayPluginConfig, TodayScope } from './constants';

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
		toolGroup: 'utility',
		order: 35,
		author: 'Chronos',
		configSchema: TODAY_CONFIG_SCHEMA as ConfigSchema<TodayPluginConfig>,
		defaultConfig: { scope: 'active', prepareReminderMinutes: DEFAULT_PREPARE_REMINDER_MINUTES },
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
