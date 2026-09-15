<script lang="ts">
	import { readBundledPluginVersion, trackPluginAnalytics } from '@chronos/core';
	import type { ChronosUiController } from '@chronos/ui-kit';
	import { appShellScroll, pluginText } from '@chronos/ui-kit';
	import { ERROR_LOG_ANALYTICS } from './analytics';
	import { copyTextWithFallback } from './copy-text';
	import { formatErrorLogClipboard, type ErrorLogEntry } from './error-log';
	import { ERROR_LOG_MESSAGES } from './messages';
	import { ERROR_LOG_PLUGIN_ID } from './constants';
	import { getErrorLogRuntime } from './runtime.svelte';

	interface Props {
		controller: ChronosUiController;
		pluginId: string;
	}

	let { controller, pluginId }: Props = $props();

	const runtime = $derived(getErrorLogRuntime(pluginId));
	const entries = $derived.by(() => {
		const seen = new Set<string>();
		return [...runtime.entries]
			.sort((a, b) => b.ts - a.ts)
			.filter((entry) => {
				if (seen.has(entry.id)) return false;
				seen.add(entry.id);
				return true;
			});
	});
	const pluginContext = $derived(controller.getPluginContext(pluginId));
	function pt(key: keyof (typeof ERROR_LOG_MESSAGES)['zh-cn']) {
		return pluginText(controller, ERROR_LOG_PLUGIN_ID, ERROR_LOG_MESSAGES, key);
	}

	function formatTimestamp(ts: number): string {
		return new Date(ts).toLocaleString(controller.currentLocale);
	}

	async function copyEntries(targetEntries: readonly ErrorLogEntry[]) {
		const text = formatErrorLogClipboard(targetEntries, {
			pluginVersion: readBundledPluginVersion(),
			userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
		});
		const ok = await copyTextWithFallback(text);
		trackPluginAnalytics(pluginContext, ERROR_LOG_PLUGIN_ID, ERROR_LOG_ANALYTICS.copy);
		pluginContext.actions.notify(
			ok ? pt('screen.notify.copySuccess') : pt('screen.notify.copyFailed'),
			ok ? 'info' : 'error'
		);
	}

	async function onCopyAll() {
		await copyEntries(entries);
	}

	async function onCopyOne(entry: ErrorLogEntry) {
		await copyEntries([entry]);
	}

	async function onClear() {
		await runtime.clear();
		trackPluginAnalytics(pluginContext, ERROR_LOG_PLUGIN_ID, ERROR_LOG_ANALYTICS.clear);
		pluginContext.actions.notify(pt('screen.notify.cleared'), 'info');
	}
</script>

<div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
	<div use:appShellScroll class="secondary-scroll min-h-0 flex-1 overflow-y-auto">
		<div class="p-4">
			<div class="ui-section-surface divide-y divide-outline/10 overflow-hidden">
				{#if entries.length === 0}
					<div class="p-6 text-center">
						<p class="text-body-medium text-on-surface-variant">{pt('screen.empty')}</p>
					</div>
				{:else}
					{#each entries as entry (entry.id)}
						<div class="flex items-start justify-between gap-3 p-3">
							<div class="min-w-0 flex-1">
								<p class="text-body-small text-on-surface-variant">
									{formatTimestamp(entry.ts)} · {entry.source}
								</p>
								{#if entry.name}
									<p class="text-title-small text-on-surface">{entry.name}</p>
								{/if}
								<p class="text-body-medium text-on-surface">{entry.message}</p>
								{#if entry.stack}
									<pre
										class="text-body-small mt-2 max-h-40 overflow-auto font-mono whitespace-pre-wrap text-on-surface-variant">{entry.stack}</pre>
								{/if}
							</div>
							<button
								type="button"
								class="ui-btn ui-btn-text shrink-0"
								onclick={() => onCopyOne(entry)}
							>
								{pt('screen.action.copyOne')}
							</button>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<div class="bottom-bar">
		<div class="mx-auto flex h-full w-full max-w-lg items-center gap-3">
			<button
				type="button"
				class="ui-btn ui-btn-outlined flex-1"
				disabled={entries.length === 0}
				onclick={onCopyAll}
			>
				{pt('screen.action.copyAll')}
			</button>
			<button
				type="button"
				class="ui-btn ui-btn-outlined flex-1"
				disabled={entries.length === 0}
				onclick={onClear}
			>
				{pt('screen.action.clear')}
			</button>
		</div>
	</div>
</div>
