<script lang="ts">
	import { DateField as UiDateField, type DateFieldLabels } from '@chronos/ui-kit';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

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

	const controller = getAppController();
	const resolvedLabels = $derived<DateFieldLabels>(
		labels ?? {
			placeholder: hostTextRead(controller, 'ui.date.placeholder'),
			today: hostTextRead(controller, 'ui.date.today'),
			clear: hostTextRead(controller, 'ui.date.clear'),
			confirm: hostTextRead(controller, 'ui.date.confirm'),
			triggerEmpty: (fieldLabel) =>
				hostTextRead(controller, 'ui.date.trigger.empty', { label: fieldLabel }),
			triggerLabeled: (fieldLabel, display) =>
				hostTextRead(controller, 'ui.date.trigger.labeled', { label: fieldLabel, display })
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
