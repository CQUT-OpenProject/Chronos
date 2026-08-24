<script lang="ts">
	import { Close, Search } from '$lib/icons';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

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

	const controller = getAppController();
	const resolvedPlaceholder = $derived(
		placeholder ?? hostTextRead(controller, 'ui.search.placeholder')
	);
	const resolvedAriaLabel = $derived(
		ariaLabel ?? hostTextRead(controller, 'ui.search.placeholder')
	);
</script>

<div
	class="flex h-11 items-center gap-2.5 rounded-full border border-outline-variant bg-surface px-4 shadow-xs transition-colors focus-within:border-brand {className}"
>
	<Search aria-hidden="true" class="size-5 shrink-0 text-on-surface-variant" />
	<input
		type="search"
		bind:value
		placeholder={resolvedPlaceholder}
		aria-label={resolvedAriaLabel}
		class="m3-body-medium w-full border-none bg-transparent p-0 text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:ring-0 focus:outline-none"
	/>
	{#if value}
		<IconButton
			variant="standard"
			size="sm"
			ariaLabel={hostTextRead(controller, 'ui.search.clearAria')}
			class="!size-6 !p-0 text-on-surface-variant hover:!bg-surface-variant/50"
			onclick={() => (value = '')}
		>
			<Close class="size-4" />
		</IconButton>
	{/if}
</div>
