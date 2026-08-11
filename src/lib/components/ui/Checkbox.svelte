<script lang="ts">
	import { Checkbox } from 'bits-ui';
	import { Check } from '$lib/icons';

	let {
		checked = $bindable(false),
		disabled = false,
		onCheckedChange,
		class: className = ''
	}: {
		checked?: boolean;
		disabled?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		class?: string;
	} = $props();
</script>

<Checkbox.Root
	bind:checked
	{disabled}
	{onCheckedChange}
	class="relative flex size-5 shrink-0 items-center justify-center rounded-md border border-outline-variant transition-colors outline-none hover:bg-surface-variant/40 focus-visible:ring-2 focus-visible:ring-brand data-[state=checked]:border-brand data-[state=checked]:bg-brand {className}"
>
	{#snippet children({ checked })}
		{#if checked}
			<Check class="size-3.5 text-on-primary" />
		{/if}
	{/snippet}
</Checkbox.Root>
