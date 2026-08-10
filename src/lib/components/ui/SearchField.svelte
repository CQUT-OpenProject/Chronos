<script lang="ts">
	import { Close, Search } from '$lib/icons';
	import IconButton from '$lib/components/ui/IconButton.svelte';

	let {
		value = $bindable(''),
		placeholder = '搜索...',
		class: className = ''
	}: {
		value?: string;
		placeholder?: string;
		class?: string;
	} = $props();
</script>

<div
	class="flex h-11 items-center gap-2.5 rounded-full border border-outline-variant bg-surface px-4 shadow-xs transition-colors focus-within:border-brand {className}"
>
	<Search class="size-5 shrink-0 text-on-surface-variant" />
	<input
		type="search"
		bind:value
		{placeholder}
		class="m3-body-medium w-full border-none bg-transparent p-0 text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:ring-0 focus:outline-none"
	/>
	{#if value}
		<IconButton
			variant="standard"
			size="sm"
			ariaLabel="清空搜索"
			class="!size-6 !p-0 text-on-surface-variant hover:!bg-surface-variant/50"
			onclick={() => (value = '')}
		>
			<Close class="size-4" />
		</IconButton>
	{/if}
</div>
