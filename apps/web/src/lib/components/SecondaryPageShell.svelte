<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { ArrowBack } from '$lib/icons';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import { haptic } from '$lib/haptic/haptic';
	import { navigateBack, type BackFallback } from '$lib/navigation';

	let {
		title,
		backFallback = { kind: 'shell' } as BackFallback,
		actions,
		flush = false,
		children
	}: {
		title: string;
		backFallback?: BackFallback;
		actions?: import('svelte').Snippet;
		flush?: boolean;
		children?: import('svelte').Snippet;
	} = $props();

	function handleBack(event: MouseEvent) {
		event.preventDefault();
		haptic.light();
		navigateBack(backFallback);
	}
</script>

<div class="secondary-page relative z-[60] flex h-dvh flex-col overflow-hidden bg-canvas">
	<TopAppBar {title} {actions} class="shrink-0">
		{#snippet leading()}
			<IconButton ariaLabel={hostT('ui.nav.back')} onclick={handleBack}>
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
