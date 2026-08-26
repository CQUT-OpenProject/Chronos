<script lang="ts">
	import SelectableOption from './SelectableOption.svelte';

	interface Option {
		label: string;
		value: string | number;
		description?: string;
	}

	let {
		id,
		name,
		label,
		description,
		options = [],
		value,
		disabled = false,
		required = false,
		onValueChange
	}: {
		id?: string;
		name?: string;
		label: string;
		description?: string;
		options?: Option[];
		value?: string | number;
		disabled?: boolean;
		required?: boolean;
		onValueChange?: (value: string | number) => void;
	} = $props();

	const fieldName = $derived(name ?? id ?? 'radio-group');
</script>

<div class="flex flex-col gap-3">
	<div class="px-1">
		<h3 class="m3-title-medium text-on-surface">
			{label}
			{#if required}
				<span class="ml-0.5 text-error">*</span>
			{/if}
		</h3>
		{#if description}
			<p class="m3-body-small mt-1 text-on-surface-variant">{description}</p>
		{/if}
	</div>

	<div class="flex flex-col gap-2.5">
		{#each options as option (option.value)}
			<SelectableOption
				name={fieldName}
				label={option.label}
				description={option.description}
				selected={value === option.value}
				{disabled}
				onclick={() => onValueChange?.(option.value)}
			/>
		{/each}
	</div>
</div>
