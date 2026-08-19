<script lang="ts">
	interface Props {
		id?: string;
		type?: string;
		label: string;
		placeholder?: string;
		value?: string | number;
		disabled?: boolean;
		required?: boolean;
		description?: string;
	}

	let {
		id,
		type = 'text',
		label,
		placeholder = '',
		value = $bindable(),
		disabled = false,
		required = false,
		description = ''
	}: Props = $props();

	const fallbackId = `input-text-${Math.random().toString(36).slice(2, 9)}`;
	const inputId = $derived(id || fallbackId);
</script>

<div class="flex flex-col gap-1.5 text-left">
	<label for={inputId} class="text-sm font-medium text-on-surface">
		{label}
		{#if required}
			<span class="ml-0.5 text-error">*</span>
		{/if}
	</label>

	<input
		id={inputId}
		{type}
		{placeholder}
		{disabled}
		{required}
		value={value ?? ''}
		oninput={(e) => (value = e.currentTarget.value)}
		class="w-full rounded-xl border border-outline/30 bg-surface-container px-3.5 py-2.5 text-sm text-on-surface transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
	/>

	{#if description}
		<span class="text-xs text-on-surface-variant">{description}</span>
	{/if}
</div>
