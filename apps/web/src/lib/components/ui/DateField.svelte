<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { DateField as UiDateField, type DateFieldLabels } from '@chronos/ui-kit';

	let {
		label,
		value = $bindable(''),
		id,
		class: className = '',
		onValueChange,
		disabled = false,
		calendarLabel = label,
		labels
	}: {
		label: string;
		value?: string;
		id?: string;
		class?: string;
		onValueChange?: (value: string) => void;
		disabled?: boolean;
		calendarLabel?: string;
		labels?: DateFieldLabels;
	} = $props();

	const resolvedLabels = $derived<DateFieldLabels>(
		labels ?? {
			placeholder: hostT('ui.date.placeholder'),
			today: hostT('ui.date.today'),
			clear: hostT('ui.date.clear'),
			confirm: hostT('ui.date.confirm'),
			triggerEmpty: (fieldLabel) => hostT('ui.date.trigger.empty', { label: fieldLabel }),
			triggerLabeled: (fieldLabel, display) =>
				hostT('ui.date.trigger.labeled', { label: fieldLabel, display })
		}
	);
</script>

<UiDateField
	{label}
	bind:value
	{id}
	class={className}
	{onValueChange}
	{disabled}
	{calendarLabel}
	labels={resolvedLabels}
/>
