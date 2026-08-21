<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		wallpaperUri?: string | null;
		children?: Snippet;
	}

	let { wallpaperUri = null, children }: Props = $props();
</script>

<div class="relative min-h-0 flex-1">
	{#if wallpaperUri}
		<div
			class="absolute inset-0 bg-cover bg-center"
			style:background-image={`url('${wallpaperUri}')`}
		></div>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>
