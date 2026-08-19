<script lang="ts">
	interface SelectOption {
		label: string;
		value: string | number;
	}

	interface Props {
		id?: string;
		label: string;
		options?: SelectOption[];
		value?: string | number;
		disabled?: boolean;
		required?: boolean;
		description?: string;
	}

	let {
		id,
		label,
		options = [],
		value = $bindable(''),
		disabled = false,
		required = false,
		description = ''
	}: Props = $props();

	const fallbackId = `input-select-${Math.random().toString(36).slice(2, 9)}`;
	const inputId = $derived(id || fallbackId);
</script>

<div class="flex flex-col gap-1.5 text-left">
	<label for={inputId} class="text-sm font-medium text-on-surface">
		{label}
		{#if required}
			<span class="ml-0.5 text-error">*</span>
		{/if}
	</label>

	<select
		id={inputId}
		{disabled}
		{required}
		bind:value
		class="w-full rounded-xl border border-outline/30 bg-surface-container px-3.5 py-2.5 text-sm text-on-surface transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
	>
		{#each options as opt (opt.value)}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>

	{#if description}
		<span class="text-xs text-on-surface-variant">{description}</span>
	{/if}
</div>
