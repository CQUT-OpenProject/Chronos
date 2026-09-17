import { defineChronosPlugin } from '@chronos/core';
import type { ChronosContext, ChronosMountable } from '@chronos/core';
import { parseStoredFrozenEpoch } from './clock';
import { CLOCK_PLUGIN_ID, CLOCK_STORAGE_KEY } from './constants';
import { CLOCK_MESSAGES } from './messages';

export interface CreateClockPluginOptions {
	screenComponent?: ChronosMountable;
}

export function createClockPlugin(options: CreateClockPluginOptions = {}) {
	const { screenComponent } = options;
	let activeCtx: ChronosContext | undefined;

	return defineChronosPlugin({
		id: CLOCK_PLUGIN_ID,
		messages: CLOCK_MESSAGES,
		nameKey: 'plugin.name',
		descriptionKey: 'plugin.description',
		category: 'tool',
		toolGroup: 'dev',
		order: 55,
		author: 'Chronos',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',
		async apply(ctx, t) {
			activeCtx = ctx;
			const stored = parseStoredFrozenEpoch(await ctx.storage.get(CLOCK_STORAGE_KEY));
			if (stored != null) {
				ctx.actions.setVirtualNow(new Date(stored));
			}

			const keywords = t('mine.keywords')
				.split(',')
				.map((entry) => entry.trim())
				.filter(Boolean);

			ctx.registerSlot('mine.item', {
				id: 'clock',
				sectionId: CLOCK_PLUGIN_ID,
				title: () => t('mine.title'),
				href: `/plugins/${CLOCK_PLUGIN_ID}`,
				icon: 'schedule',
				iconTone: 'secondary',
				keywords,
				order: 40
			});

			ctx.registerSlot('shell.route.screen', {
				id: CLOCK_PLUGIN_ID,
				title: () => t('screen.title'),
				...(screenComponent ? { component: screenComponent } : {})
			});
		},
		dispose() {
			const ctx = activeCtx;
			activeCtx = undefined;
			ctx?.actions.setVirtualNow(null);
		}
	});
}

export { CLOCK_PLUGIN_ID, CLOCK_STORAGE_KEY } from './constants';
