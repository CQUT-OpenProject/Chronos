<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		wallpaperUri?: string | null;
		children?: Snippet;
	}

	let { wallpaperUri = null, children }: Props = $props();
</script>

<div class="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
	{#if wallpaperUri}
		<div
			class="absolute inset-0"
			style:background-image={`url("${wallpaperUri}")`}
			style:background-size="cover"
			style:background-position="center"
			style:background-repeat="no-repeat"
		></div>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>
