<script lang="ts">
	import { formatCompactDate, trackPluginAnalytics } from '@chronos/core';
	import {
		appLocaleToBcp47,
		appShellScroll,
		DateField,
		pluginText,
		TimePicker,
		type ChronosUiController,
		type DateFieldLabels,
		type TimePickerLabels,
		type TimeValue
	} from '@chronos/ui-kit';
	import { fromStore } from 'svelte/store';
	import { onMount } from 'svelte';
	import { CLOCK_ANALYTICS } from './analytics';
	import { combineLocalDateTime, partsFromDate } from './clock';
	import { CLOCK_PLUGIN_ID, CLOCK_STORAGE_KEY } from './constants';
	import { CLOCK_MESSAGES } from './messages';

	interface Props {
		controller: ChronosUiController;
		pluginId: string;
	}

	let { controller, pluginId }: Props = $props();

	const ui = $derived(fromStore(controller.snapshot));
	const pluginContext = $derived(controller.getPluginContext(pluginId));
	const locale = $derived(appLocaleToBcp47(ui.current.currentLocale));

	function pt(key: keyof (typeof CLOCK_MESSAGES)['zh-cn'], params?: Record<string, unknown>) {
		void ui.current.slotVersion;
		return pluginText(controller, CLOCK_PLUGIN_ID, CLOCK_MESSAGES, key, params);
	}

	const wallParts = partsFromDate(new Date());
	let draftIso = $state(wallParts.isoDate);
	let draftTime = $state<TimeValue>(wallParts.time);

	onMount(() => {
		const parts = partsFromDate(controller.getPluginContext(pluginId).state.now);
		draftIso = parts.isoDate;
		draftTime = parts.time;
	});

	const dateFieldLabels = $derived<DateFieldLabels>({
		placeholder: pt('screen.field.date.placeholder'),
		today: pt('screen.field.date.today'),
		clear: pt('screen.field.date.clear'),
		confirm: pt('screen.field.date.confirm'),
		triggerEmpty: (label) => pt('screen.field.date.triggerEmpty', { label }),
		triggerLabeled: (label, display) => pt('screen.field.date.triggerLabeled', { label, display })
	});

	const timePickerLabels = $derived<TimePickerLabels>({
		placeholder: pt('screen.field.time'),
		hour: pt('screen.field.time.hour'),
		minute: pt('screen.field.time.minute'),
		cancel: pt('screen.field.time.cancel'),
		confirm: pt('screen.field.date.confirm'),
		triggerEmpty: (label) => pt('screen.field.date.triggerEmpty', { label }),
		triggerLabeled: (label, display) => pt('screen.field.date.triggerLabeled', { label, display }),
		columnAria: (label, column) => pt('screen.field.time.columnAria', { label, column })
	});

	const frozen = $derived(ui.current.clockFrozen);
	const effectiveNow = $derived(pluginContext.state.now);
	const headerDate = $derived(formatCompactDate(partsFromDate(effectiveNow).isoDate));
	const headerTime = $derived(
		effectiveNow.toLocaleTimeString(locale, {
			hour: '2-digit',
			minute: '2-digit'
		})
	);
	const statusBadge = $derived(frozen ? pt('screen.status.frozen') : pt('screen.status.system'));
	const statusSubtitle = $derived(
		frozen ? pt('screen.status.subtitle.frozen') : pt('screen.status.subtitle.system')
	);

	const draftInstant = $derived(combineLocalDateTime(draftIso, draftTime));
	const canApply = $derived(
		draftInstant != null && draftInstant.getTime() !== effectiveNow.getTime()
	);

	async function onApply() {
		const next = combineLocalDateTime(draftIso, draftTime);
		if (!next) {
			pluginContext.actions.notify(pt('screen.notify.invalid'), 'warn');
			return;
		}
		await pluginContext.storage.set(CLOCK_STORAGE_KEY, next.getTime());
		pluginContext.actions.setVirtualNow(next);
		trackPluginAnalytics(pluginContext, CLOCK_PLUGIN_ID, CLOCK_ANALYTICS.apply);
		pluginContext.actions.notify(pt('screen.notify.applied'), 'info');
	}

	async function onReset() {
		await pluginContext.storage.delete(CLOCK_STORAGE_KEY);
		pluginContext.actions.setVirtualNow(null);
		const parts = partsFromDate(pluginContext.state.now);
		draftIso = parts.isoDate;
		draftTime = parts.time;
		trackPluginAnalytics(pluginContext, CLOCK_PLUGIN_ID, CLOCK_ANALYTICS.reset);
		pluginContext.actions.notify(pt('screen.notify.reset'), 'info');
	}
</script>

<div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
	<header
		class="relative z-10 shrink-0 border-b border-outline/10 bg-surface/90 px-4 pt-6 pb-4 backdrop-blur-sm"
	>
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">
				<p class="text-headline-small text-on-surface tabular-nums">
					{headerDate}
					<span class="text-on-surface-variant">·</span>
					{headerTime}
				</p>
				<p class="text-body-medium mt-1 text-on-surface-variant">{statusSubtitle}</p>
			</div>
			<span
				class="text-label-small shrink-0 rounded-full px-2.5 py-1 {frozen
					? 'bg-secondary-container text-on-secondary-container'
					: 'bg-surface-container-high text-on-surface-variant'}"
			>
				{statusBadge}
			</span>
		</div>
	</header>

	<div use:appShellScroll class="secondary-scroll relative z-0 min-h-0 flex-1 overflow-y-auto">
		<div class="flex flex-col gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
			<section class="ui-section-surface ui-section-surface--comfortable">
				<div class="ui-section-stack">
					<DateField
						label={pt('screen.field.date')}
						bind:value={draftIso}
						required
						variant="section"
						labels={dateFieldLabels}
						{locale}
					/>

					<TimePicker
						label={pt('screen.field.time')}
						bind:value={draftTime}
						variant="section"
						labels={timePickerLabels}
						sheetDragDismissAria={pt('screen.field.time.sheetDragDismiss')}
						idPrefix="clock-time"
					/>
				</div>
			</section>
		</div>
	</div>

	<div class="bottom-bar">
		<div class="mx-auto flex h-full w-full max-w-lg items-center gap-3">
			<button
				type="button"
				class="ui-btn ui-btn-outlined flex-1"
				disabled={!frozen}
				onclick={() => void onReset()}
			>
				{pt('screen.action.reset')}
			</button>
			<button
				type="button"
				class="ui-btn ui-btn-filled flex-1"
				disabled={!canApply}
				onclick={() => void onApply()}
			>
				{pt('screen.action.apply')}
			</button>
		</div>
	</div>
</div>
