<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { createHostTimePickerLabels } from '$lib/components/ui/host-form-labels';
	import {
		TimePicker as UiTimePicker,
		type TimePickerLabels,
		type TimeValue
	} from '@chronos/ui-kit';

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
		labels,
		sheetDragDismissAria
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
	} = $props();

	const resolvedLabels = $derived<TimePickerLabels>(labels ?? createHostTimePickerLabels());
	const resolvedSheetDragDismissAria = $derived(
		sheetDragDismissAria ?? hostT('ui.bottomSheet.dragDismissAria')
	);
</script>

<UiTimePicker
	{label}
	bind:value
	{id}
	{idPrefix}
	class={className}
	{onValueChange}
	{disabled}
	{description}
	{variant}
	labels={resolvedLabels}
	sheetDragDismissAria={resolvedSheetDragDismissAria}
/>
