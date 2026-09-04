import { defineChronosPlugin } from '@chronos/core';
import type { ChronosContext, ChronosMountable } from '@chronos/core';
import { HOLIDAY_MESSAGES } from './messages';
import { HOLIDAY_PLUGIN_ID } from './constants';
import { clearHolidayCalendarFromAllTimetables, ensureHolidayCalendarSynced } from './holiday-sync';

export interface CreateHolidayPluginOptions {
	screenComponent?: ChronosMountable;
}

export function createHolidayPlugin(options: CreateHolidayPluginOptions = {}) {
	const { screenComponent } = options;
	let activeCtx: ChronosContext | undefined;

	return defineChronosPlugin({
		id: HOLIDAY_PLUGIN_ID,
		messages: HOLIDAY_MESSAGES,
		nameKey: 'plugin.name',
		descriptionKey: 'plugin.description',
		category: 'tool',
		order: 45,
		author: 'Chronos',
		homepage: 'https://github.com/NateScarlet/holiday-cn',
		allowedDomains: ['fastly.jsdelivr.net', 'raw.githubusercontent.com'],
		async apply(ctx, t) {
			activeCtx = ctx;
			const keywords = t('mine.keywords')
				.split(',')
				.map((entry) => entry.trim())
				.filter(Boolean);

			ctx.registerSlot('mine.item', {
				id: 'holiday-calendar',
				sectionId: 'data-sync',
				title: () => t('mine.title'),
				href: `/plugins/${HOLIDAY_PLUGIN_ID}`,
				icon: 'event',
				iconTone: 'secondary',
				keywords,
				order: 25
			});

			ctx.registerSlot('shell.route.screen', {
				id: HOLIDAY_PLUGIN_ID,
				title: () => t('screen.title'),
				...(screenComponent ? { component: screenComponent } : {})
			});

			try {
				await ensureHolidayCalendarSynced(ctx);
			} catch {
				ctx.actions.notify(t('screen.error.syncFailed'), 'warn');
			}

			ctx.on('timetable:switched', async () => {
				try {
					await ensureHolidayCalendarSynced(ctx);
				} catch {
					// Silent on timetable switch; user can resync manually.
				}
			});
		},
		async dispose() {
			const ctx = activeCtx;
			activeCtx = undefined;
			if (!ctx) return;
			await clearHolidayCalendarFromAllTimetables(ctx);
		}
	});
}

export { HOLIDAY_PLUGIN_ID } from './constants';
