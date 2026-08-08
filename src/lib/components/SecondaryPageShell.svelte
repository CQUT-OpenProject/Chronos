<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { Button } from 'm3-svelte';
	import { ArrowBack } from '$lib/icons';
	import TopAppBar from '$lib/components/TopAppBar.svelte';

	let {
		title,
		backHref,
		actions,
		children
	}: {
		title: string;
		backHref: Pathname;
		actions?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
	} = $props();

	function vibrate() {
		navigator.vibrate?.(10);
	}
</script>

<div class="min-h-dvh bg-canvas">
	<TopAppBar {title} {actions}>
		{#snippet leading()}
			<Button
				variant="text"
				size="s"
				iconType="full"
				square
				href={resolve(backHref)}
				aria-label="返回"
				onclick={vibrate}
				class="!text-on-surface"
			>
				<ArrowBack class="text-on-surface" />
			</Button>
		{/snippet}
	</TopAppBar>
	<main class="p-4">
		{@render children?.()}
	</main>
</div>
