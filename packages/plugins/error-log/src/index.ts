import { defineChronosPlugin, IErrorCaptureService } from '@chronos/core';
import type { ChronosMountable } from '@chronos/core';
import { ERROR_LOG_PLUGIN_ID } from './constants';
import { ERROR_LOG_MESSAGES } from './messages';
import { createErrorLogRuntime } from './runtime.svelte';

export interface CreateErrorLogPluginOptions {
	screenComponent?: ChronosMountable;
}

export function createErrorLogPlugin(options: CreateErrorLogPluginOptions = {}) {
	const { screenComponent } = options;

	return defineChronosPlugin({
		id: ERROR_LOG_PLUGIN_ID,
		messages: ERROR_LOG_MESSAGES,
		nameKey: 'plugin.name',
		descriptionKey: 'plugin.description',
		category: 'tool',
		toolGroup: 'dev',
		order: 50,
		author: 'Chronos',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',
		async apply(ctx, t) {
			const runtime = createErrorLogRuntime(ctx);
			await runtime.load();

			const errorCapture = ctx.tryService(IErrorCaptureService);
			if (errorCapture) {
				ctx.addDisposable(
					errorCapture.onCaptured((entry) => {
						void runtime.append(entry);
					})
				);
			}
			ctx.addDisposable({ dispose: () => runtime.dispose() });

			const keywords = t('mine.keywords')
				.split(',')
				.map((entry) => entry.trim())
				.filter(Boolean);

			ctx.registerSlot('mine.item', {
				id: 'error-log',
				sectionId: ERROR_LOG_PLUGIN_ID,
				title: () => t('mine.title'),
				href: `/plugins/${ERROR_LOG_PLUGIN_ID}`,
				icon: 'history',
				iconTone: 'secondary',
				keywords,
				order: 35
			});

			ctx.registerSlot('shell.route.screen', {
				id: ERROR_LOG_PLUGIN_ID,
				title: () => t('screen.title'),
				...(screenComponent ? { component: screenComponent } : {})
			});
		}
	});
}

export { ERROR_LOG_PLUGIN_ID } from './constants';
