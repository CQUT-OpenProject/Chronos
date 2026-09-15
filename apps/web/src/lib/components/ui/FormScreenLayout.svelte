<script lang="ts">
	/**
	 * Scrollable form body with a pinned bottom action bar.
	 * Use inside `SecondaryPageShell` with `flush` so only this module owns scrolling.
	 */
	import type { Snippet } from 'svelte';
	import ActionBottomBar from '$lib/components/ui/ActionBottomBar.svelte';
	import { appScroll } from '@chronos/ui-kit';

	let {
		children,
		footer,
		rubberBand = true
	}: {
		children?: Snippet;
		footer?: Snippet;
		rubberBand?: boolean;
	} = $props();
</script>

<div class="flex h-full min-h-0 flex-1 flex-col">
	<div
		use:appScroll={{ rubberBand }}
		class="secondary-scroll mx-auto w-full max-w-lg flex-1 overflow-y-auto p-4"
	>
		{@render children?.()}
	</div>

	{#if footer}
		<ActionBottomBar>
			{@render footer()}
		</ActionBottomBar>
	{/if}
</div>
