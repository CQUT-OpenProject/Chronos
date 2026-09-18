<script lang="ts">
	import { tick } from 'svelte';
	import { haptic } from '../haptic/haptic';
	import BottomSheet from '../overlay/BottomSheet.svelte';
	import TimeWheel from './TimeWheel.svelte';
	import {
		buildTimeFieldTriggerLabel,
		DEFAULT_TIME_PICKER_LABELS,
		formatTimeValue,
		type TimePickerLabels,
		type TimeValue
	} from './time-wheel-utils';
	import type { OverlayHistoryPort } from '../overlay/history-overlay';

	let {
		label,
		value = $bindable({ hour: 0, minute: 0 }),
		id,
		idPrefix,
		class: className = '',
		onValueChange,
		disabled = false,
		description,
		variant = 'field',
		labels = DEFAULT_TIME_PICKER_LABELS,
		sheetDragDismissAria = '向下拖动关闭',
		historyPort,
		manageHistory,
		overlayId
	}: {
		label: string;
		value?: TimeValue;
		id?: string;
		idPrefix?: string;
		class?: string;
		onValueChange?: (value: TimeValue) => void;
		disabled?: boolean;
		description?: string;
		variant?: 'field' | 'section';
		labels?: TimePickerLabels;
		sheetDragDismissAria?: string;
		historyPort?: OverlayHistoryPort;
		manageHistory?: boolean;
		overlayId?: string;
	} = $props();

	const instanceId = $props.id();
	const fieldId = $derived(id ?? instanceId);
	const labelId = $derived(`${fieldId}-label`);
	const resolvedIdPrefix = $derived(idPrefix ?? fieldId);
	const resolvedOverlayId = $derived(overlayId ?? `time-picker-${instanceId}`);
	const resolvedManageHistory = $derived(manageHistory ?? historyPort != null);
	const isSection = $derived(variant === 'section');

	let open = $state(false);
	let draftTime = $state<TimeValue>({ hour: 0, minute: 0 });
	let timeWheel: TimeWheel | null = $state(null);

	const displayValue = $derived(formatTimeValue(value));
	const triggerAriaLabel = $derived(
		buildTimeFieldTriggerLabel(label, open ? draftTime : value, labels)
	);

	function openPicker() {
		if (disabled) return;
		draftTime = { hour: value.hour, minute: value.minute };
		open = true;
		void tick().then(() => timeWheel?.scrollToValue());
	}

	function closePicker() {
		open = false;
	}

	function confirmSelection() {
		haptic.light();
		const next = timeWheel?.commitDraft() ?? draftTime;
		if (next.hour !== value.hour || next.minute !== value.minute) {
			value = next;
			onValueChange?.(next);
		}
		closePicker();
	}
</script>

<div class={isSection ? ['flex flex-col gap-3', className] : undefined}>
	{#if isSection}
		<div class="px-1">
			<h3 id={labelId} class="text-title-medium text-on-surface">{label}</h3>
			{#if description}
				<p class="text-body-small mt-1 text-on-surface-variant">{description}</p>
			{/if}
		</div>
	{/if}

	<div class={isSection ? 'ui-form-field' : ['ui-form-field', className]}>
		{#if !isSection}
			<button
				type="button"
				id={labelId}
				class="ui-field-label cursor-pointer border-0 bg-transparent p-0 text-left"
				onclick={openPicker}
			>
				{label}
			</button>
		{/if}

		<button
			type="button"
			id={fieldId}
			class="ui-form-field-input ui-date-field-input"
			aria-labelledby={labelId}
			aria-label={triggerAriaLabel}
			aria-haspopup="dialog"
			aria-expanded={open}
			{disabled}
			onclick={openPicker}
		>
			<span
				class="ui-date-field-value text-body-large truncate text-left text-on-surface tabular-nums"
			>
				{displayValue}
			</span>
			<span class="ui-date-field-trigger" aria-hidden="true">
				<svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path
						d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
					/>
				</svg>
			</span>
		</button>
	</div>
</div>

<BottomSheet
	bind:open
	title={label}
	dragDismissAria={sheetDragDismissAria}
	manageHistory={resolvedManageHistory}
	overlayId={resolvedOverlayId}
	{historyPort}
>
	<div class="px-4 pt-1 pb-2">
		<TimeWheel
			bind:this={timeWheel}
			bind:value={draftTime}
			{label}
			{labels}
			idPrefix={resolvedIdPrefix}
		/>
	</div>

	{#snippet footer()}
		<button
			type="button"
			class="text-label-large h-11 rounded-full px-5 text-on-surface-variant hover:bg-on-surface/5 active:bg-on-surface/10"
			onclick={closePicker}
		>
			{labels.cancel}
		</button>
		<button
			type="button"
			class="text-label-large h-11 rounded-full bg-brand px-6 text-on-primary active:opacity-90"
			onclick={confirmSelection}
		>
			{labels.confirm}
		</button>
	{/snippet}
</BottomSheet>
