<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		footer
	}: {
		children?: Snippet;
		footer?: Snippet;
	} = $props();
</script>

<div class="flex h-full min-h-0 flex-1 flex-col">
	<div class="flex-1 overflow-y-auto p-4">
		{@render children?.()}
	</div>

	{#if footer}
		<div class="bottom-bar">
			{@render footer()}
		</div>
	{/if}
</div>
