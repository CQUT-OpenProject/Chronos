<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { ArrowBack } from '$lib/icons';
	import TopAppBar from '$lib/components/TopAppBar.svelte';

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

	function vibrate() {
		navigator.vibrate?.(10);
	}
</script>

<div class="relative z-[60] flex h-dvh flex-col overflow-hidden bg-canvas">
	<TopAppBar {title} {actions} class="shrink-0">
		{#snippet leading()}
			<a
				href={resolve(backHref)}
				aria-label="返回"
				onclick={vibrate}
				class="flex size-10 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-variant/50 active:bg-surface-variant/80"
			>
				<ArrowBack class="size-6 text-on-surface" />
			</a>
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
