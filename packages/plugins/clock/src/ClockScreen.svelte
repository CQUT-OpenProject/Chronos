<script lang="ts">
	import { trackPluginAnalytics } from '@chronos/core';
	import {
		appLocaleToBcp47,
		appShellScroll,
		DateField,
		pluginText,
		TimeWheel,
		type ChronosUiController,
		type DateFieldLabels,
		type TimePickerLabels,
		type TimeValue
	} from '@chronos/ui-kit';
	import { fromStore } from 'svelte/store';
	import { onMount, tick } from 'svelte';
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

	function pt(key: keyof (typeof CLOCK_MESSAGES)['zh-cn'], params?: Record<string, unknown>) {
		void ui.current.slotVersion;
		return pluginText(controller, CLOCK_PLUGIN_ID, CLOCK_MESSAGES, key, params);
	}

	const wallParts = partsFromDate(new Date());
	let draftIso = $state(wallParts.isoDate);
	let draftTime = $state<TimeValue>(wallParts.time);
	let timeWheel: { scrollToValue(): void } | null = $state(null);

	onMount(() => {
		const parts = partsFromDate(controller.getPluginContext(pluginId).state.now);
		draftIso = parts.isoDate;
		draftTime = parts.time;
		void tick().then(() => timeWheel?.scrollToValue());
	});

	const dateFieldLabels = $derived<DateFieldLabels>({
		placeholder: pt('screen.field.date.placeholder'),
		today: pt('screen.field.date.today'),
		clear: pt('screen.field.date.clear'),
		confirm: pt('screen.field.date.confirm'),
		triggerEmpty: (label) => pt('screen.field.date.triggerEmpty', { label }),
		triggerLabeled: (label, display) => pt('screen.field.date.triggerLabeled', { label, display })
	});

	const timeWheelLabels = $derived<TimePickerLabels>({
		placeholder: pt('screen.field.time'),
		hour: pt('screen.field.time.hour'),
		minute: pt('screen.field.time.minute'),
		cancel: '',
		confirm: pt('screen.field.date.confirm'),
		triggerEmpty: () => '',
		triggerLabeled: () => '',
		columnAria: (label, column) => pt('screen.field.time.columnAria', { label, column })
	});

	const frozen = $derived(ui.current.clockFrozen);
	const statusText = $derived(
		frozen
			? pt('screen.status.frozen', {
					datetime: ui.current.clockNow.toLocaleString(appLocaleToBcp47(ui.current.currentLocale), {
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
						hour: '2-digit',
						minute: '2-digit'
					})
				})
			: pt('screen.status.system')
	);

	const canApply = $derived(combineLocalDateTime(draftIso, draftTime) != null);

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
		await tick();
		timeWheel?.scrollToValue();
		trackPluginAnalytics(pluginContext, CLOCK_PLUGIN_ID, CLOCK_ANALYTICS.reset);
		pluginContext.actions.notify(pt('screen.notify.reset'), 'info');
	}
</script>

<div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
	<div use:appShellScroll class="secondary-scroll min-h-0 flex-1 overflow-y-auto">
		<div class="flex flex-col gap-4 p-4">
			<div class="ui-section-surface divide-outline/10 overflow-hidden p-4">
				<p class="text-body-medium text-on-surface">{statusText}</p>
			</div>

			<div class="ui-section-surface divide-outline/10 overflow-hidden p-4">
				<DateField
					label={pt('screen.field.date')}
					bind:value={draftIso}
					required
					variant="section"
					labels={dateFieldLabels}
					locale={appLocaleToBcp47(ui.current.currentLocale)}
				/>
			</div>

			<div class="ui-section-surface divide-outline/10 overflow-hidden p-4">
				<p class="text-title-medium mb-3 text-on-surface">{pt('screen.field.time')}</p>
				<TimeWheel
					bind:this={timeWheel}
					bind:value={draftTime}
					label={pt('screen.field.time')}
					labels={timeWheelLabels}
					idPrefix="clock-time"
				/>
			</div>
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
