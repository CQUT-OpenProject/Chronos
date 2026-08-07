<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	import { Button } from 'm3-svelte';
	import { ArrowBack } from '$lib/icons';

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
	<header class="m3-top-app-bar">
		<Button
			variant="text"
			size="s"
			iconType="full"
			square
			href={resolve(backHref)}
			aria-label="返回"
			onclick={vibrate}
		>
			<ArrowBack />
		</Button>
		<h1 class="m3-title-large">{title}</h1>
		{#if actions}
			{@render actions()}
		{/if}
	</header>
	<main class="p-4">
		{#key page.url.pathname}
			<div in:fly={{ x: 14, duration: 260 }} out:fade={{ duration: 200 }}>
				{@render children?.()}
			</div>
		{/key}
	</main>
</div>
