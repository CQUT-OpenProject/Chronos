<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { Close, Search } from '$lib/icons';
	import IconButton from '$lib/components/ui/IconButton.svelte';

	let {
		value = $bindable(''),
		placeholder,
		ariaLabel,
		class: className = ''
	}: {
		value?: string;
		placeholder?: string;
		ariaLabel?: string;
		class?: string;
	} = $props();

	const resolvedPlaceholder = $derived(placeholder ?? hostT('ui.search.placeholder'));
	const resolvedAriaLabel = $derived(ariaLabel ?? hostT('ui.search.placeholder'));
</script>

<div
	class="rounded-pill flex h-12 items-center gap-2.5 border border-outline-variant bg-surface px-4 shadow-xs transition-colors focus-within:border-brand {className}"
>
	<Search aria-hidden="true" class="size-5 shrink-0 text-on-surface-variant" />
	<input
		type="search"
		bind:value
		placeholder={resolvedPlaceholder}
		aria-label={resolvedAriaLabel}
		class="text-body-medium w-full border-none bg-transparent p-0 text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:ring-0 focus:outline-none"
	/>
	{#if value}
		<IconButton
			variant="standard"
			size="sm"
			ariaLabel={hostT('ui.search.clearAria')}
			class="!size-6 !p-0 text-on-surface-variant hover:!bg-surface-variant/50"
			onclick={() => (value = '')}
		>
			<Close class="size-4" />
		</IconButton>
	{/if}
</div>
