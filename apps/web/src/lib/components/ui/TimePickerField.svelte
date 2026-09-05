<script lang="ts">
	import { tick } from 'svelte';
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import {
		DEFAULT_TIME_PICKER_LABELS,
		formatTimeValue,
		parseTimeValue,
		type TimePickerLabels,
		type TimeValue
	} from '@chronos/ui-kit';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import TimeWheel from '$lib/components/ui/TimeWheel.svelte';

	let {
		label,
		value = $bindable(''),
		id,
		class: className = '',
		onValueChange,
		disabled = false,
		labels
	}: {
		label: string;
		value?: string;
		id?: string;
		class?: string;
		onValueChange?: (value: string) => void;
		disabled?: boolean;
		labels?: TimePickerLabels;
	} = $props();

	const instanceId = $props.id();
	const fieldId = $derived(id ?? instanceId);
	const labelId = $derived(`${fieldId}-label`);

	let open = $state(false);
	let draft = $state<TimeValue>({ hour: 0, minute: 0 });
	let wheel: TimeWheel | null = $state(null);

	const resolvedLabels = $derived<TimePickerLabels>(
		labels ?? {
			...DEFAULT_TIME_PICKER_LABELS,
			placeholder: hostT('ui.time.placeholder'),
			hour: hostT('ui.time.hour'),
			minute: hostT('ui.time.minute'),
			cancel: hostT('common.cancel'),
			confirm: hostT('common.confirm'),
			triggerEmpty: (fieldLabel) => hostT('ui.time.trigger.empty', { label: fieldLabel }),
			triggerLabeled: (fieldLabel, display) =>
				hostT('ui.time.trigger.labeled', { label: fieldLabel, display }),
			columnAria: (fieldLabel, column) => hostT('ui.time.column', { label: fieldLabel, column })
		}
	);

	const safeValue = $derived(parseTimeValue(value) ?? { hour: 0, minute: 0 });
	const hasValue = $derived(parseTimeValue(value) !== undefined);
	const displayValue = $derived(hasValue ? formatTimeValue(safeValue) : '');
	const triggerLabel = $derived(
		hasValue
			? resolvedLabels.triggerLabeled(label, displayValue)
			: resolvedLabels.triggerEmpty(label)
	);

	async function openPicker() {
		if (disabled) return;
		draft = { ...safeValue };
		open = true;
		await tick();
		wheel?.scrollToValue();
	}

	function confirmSelection() {
		const next = formatTimeValue(draft);
		if (next !== value) {
			value = next;
			onValueChange?.(next);
		}
		open = false;
	}
</script>

<div class={['ui-form-field', className]}>
	<button
		type="button"
		id={labelId}
		class="ui-field-label cursor-pointer border-0 bg-transparent p-0 text-left"
		{disabled}
		onclick={openPicker}
	>
		{label}
	</button>
	<button
		type="button"
		class="ui-form-field-input ui-date-field-input"
		aria-label={triggerLabel}
		{disabled}
		onclick={openPicker}
	>
		<span
			class={[
				'ui-date-field-value text-body-large truncate text-left tabular-nums',
				hasValue ? 'text-on-surface' : 'text-on-surface-variant/60'
			]}
		>
			{hasValue ? displayValue : resolvedLabels.placeholder}
		</span>
		<span class="ui-date-field-trigger" aria-hidden="true">
			<svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.2 14.2-1.4 1.4L7 11V7h2v3.6l5.2 5.6Z" />
			</svg>
		</span>
	</button>
</div>

<BottomSheet bind:open title={hasValue ? displayValue : label}>
	<div class="px-4 pt-1 pb-2">
		<TimeWheel
			bind:this={wheel}
			bind:value={draft}
			{label}
			labels={resolvedLabels}
			idPrefix={fieldId}
			{disabled}
		/>
	</div>

	<div class="flex items-center justify-end gap-2 px-4 pb-2">
		<button
			type="button"
			class="text-label-large h-11 rounded-full px-5 text-on-surface-variant hover:bg-on-surface/5 active:bg-on-surface/10"
			onclick={() => (open = false)}
		>
			{resolvedLabels.cancel}
		</button>
		<button
			type="button"
			class="text-label-large h-11 rounded-full bg-brand px-6 text-on-primary hover:shadow-xs active:opacity-90"
			onclick={confirmSelection}
		>
			{resolvedLabels.confirm}
		</button>
	</div>
</BottomSheet>
