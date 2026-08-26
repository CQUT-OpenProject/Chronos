<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { ArrowBack } from '$lib/icons';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import { haptic } from '$lib/haptic/haptic';
	import { getAppController } from '$lib/services/app-engine';

	let {
		title,
		backHref,
		actions,
		flush = false,
		children
	}: {
		title: string;
		backHref: Pathname;
		actions?: import('svelte').Snippet;
		flush?: boolean;
		children?: import('svelte').Snippet;
	} = $props();

	const controller = getAppController();
</script>

<div class="relative z-[60] flex h-dvh flex-col overflow-hidden bg-canvas">
	<TopAppBar {title} {actions} class="shrink-0">
		{#snippet leading()}
			<IconButton
				href={resolve(backHref as any)}
				ariaLabel={hostT('ui.nav.back')}
				onclick={() => haptic.light()}
			>
				<ArrowBack class="size-6 text-on-surface" />
			</IconButton>
		{/snippet}
	</TopAppBar>
	<main
		class="min-h-0 w-full flex-1 {flush
			? 'flex flex-col overflow-hidden'
			: 'mx-auto max-w-lg overflow-y-auto p-4'}"
	>
		{@render children?.()}
	</main>
</div>
