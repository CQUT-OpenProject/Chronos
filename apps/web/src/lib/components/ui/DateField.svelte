<script lang="ts">
	import { getAppController } from '$lib/services/app-engine';
	import { createHostDateFieldLabels } from '$lib/components/ui/host-form-labels';
	import {
		DateField as UiDateField,
		appLocaleToBcp47,
		type DateFieldLabels
	} from '@chronos/ui-kit';

	let {
		label,
		value = $bindable(''),
		id,
		class: className = '',
		onValueChange,
		disabled = false,
		calendarLabel = label,
		labels,
		locale
	}: {
		label: string;
		value?: string;
		id?: string;
		class?: string;
		onValueChange?: (value: string) => void;
		disabled?: boolean;
		calendarLabel?: string;
		labels?: DateFieldLabels;
		locale?: string;
	} = $props();

	const controller = getAppController();
	const resolvedLocale = $derived(locale ?? appLocaleToBcp47(controller.currentLocale));
	const resolvedLabels = $derived<DateFieldLabels>(labels ?? createHostDateFieldLabels());
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
	locale={resolvedLocale}
/>
