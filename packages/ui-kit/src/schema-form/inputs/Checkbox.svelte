<script lang="ts">
	interface Props {
		id?: string;
		label: string;
		description?: string;
		checked?: boolean;
		disabled?: boolean;
		onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		id,
		label,
		description = '',
		checked = $bindable(),
		disabled = false,
		onchange
	}: Props = $props();

	const instanceId = $props.id();
	const inputId = $derived(id || instanceId);
</script>

<div class="flex items-start gap-3 py-1 text-left">
	<input
		id={inputId}
		type="checkbox"
		{disabled}
		checked={Boolean(checked)}
		onchange={(e) => {
			checked = e.currentTarget.checked;
			onchange?.(e);
		}}
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
