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

<label
	for={inputId}
	class="flex min-h-11 cursor-pointer items-center gap-3 py-1 text-left select-none"
>
	<input
		id={inputId}
		type="checkbox"
		{disabled}
		checked={Boolean(checked)}
		onchange={(e) => {
			checked = e.currentTarget.checked;
			onchange?.(e);
		}}
		class="size-5 shrink-0 rounded border-outline/40 text-brand accent-brand transition focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
	/>
	<span class="flex min-w-0 flex-col">
		<span class="text-body-medium font-medium text-on-surface">{label}</span>
		{#if description}
			<span class="text-body-small text-on-surface-variant">{description}</span>
		{/if}
	</span>
</label>
