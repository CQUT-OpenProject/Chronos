<script lang="ts">
	interface Props {
		id?: string;
		label: string;
		description?: string;
		checked?: boolean;
		disabled?: boolean;
	}

	let {
		id,
		label,
		description = '',
		checked = $bindable(false),
		disabled = false
	}: Props = $props();

	const fallbackId = `input-check-${Math.random().toString(36).slice(2, 9)}`;
	const inputId = $derived(id || fallbackId);
</script>

<div class="flex items-start gap-3 py-1 text-left">
	<input
		id={inputId}
		type="checkbox"
		{disabled}
		bind:checked
		class="mt-1 size-4.5 rounded border-outline/40 text-primary accent-primary transition focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
	/>
	<div class="flex flex-col">
		<label for={inputId} class="cursor-pointer text-sm font-medium text-on-surface select-none">
			{label}
		</label>
		{#if description}
			<span class="text-xs text-on-surface-variant">{description}</span>
		{/if}
	</div>
</div>
