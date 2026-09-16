<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { ArrowBack } from '$lib/icons';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import { haptic } from '$lib/haptic/haptic';
	import { navigateBack, type BackFallback } from '$lib/navigation';
	import { registerPageBackFallback } from '$lib/navigation/nav-coordinator';
	import { appShellScroll } from '@chronos/ui-kit';

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

	$effect(() => registerPageBackFallback(backFallback));

	function handleBack(event: MouseEvent) {
		event.preventDefault();
		haptic.light();
		navigateBack(backFallback);
	}
</script>

<div
	class="secondary-page relative z-[var(--z-secondary-page)] flex h-dvh flex-col overflow-hidden bg-canvas"
>
	<TopAppBar {title} {actions} class="shrink-0">
		{#snippet leading()}
			<IconButton ariaLabel={hostT('ui.nav.back')} onclick={handleBack}>
				<ArrowBack class="size-6 text-on-surface" />
			</IconButton>
		{/snippet}
	</TopAppBar>
	{#if flush}
		<main class="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
			{@render children?.()}
		</main>
	{:else}
		<main
			use:appShellScroll
			class="secondary-scroll mx-auto min-h-0 w-full max-w-lg flex-1 overflow-y-auto p-4"
		>
			{@render children?.()}
		</main>
	{/if}
</div>
