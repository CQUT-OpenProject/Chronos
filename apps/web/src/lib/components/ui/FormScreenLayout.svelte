<script lang="ts">
	/**
	 * Flush secondary-page body: optional pinned header, scrollable stack, optional bottom bar.
	 * Use inside `SecondaryPageShell` with `flush`.
	 */
	import type { Snippet } from 'svelte';
	import ActionBottomBar from '$lib/components/ui/ActionBottomBar.svelte';
	import { appShellScroll } from '@chronos/ui-kit';

	let {
		children,
		header,
		footer,
		class: className = ''
	}: {
		children?: Snippet;
		header?: Snippet;
		footer?: Snippet;
		class?: string;
	} = $props();
</script>

<div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden {className}">
	{#if header}
		<header
			class="relative z-10 shrink-0 border-b border-outline/10 bg-surface/90 px-4 pt-3 pb-4 backdrop-blur-sm"
		>
			{@render header()}
		</header>
	{/if}

	<div use:appShellScroll class="secondary-scroll relative z-0 min-h-0 flex-1 overflow-y-auto">
		<div class="ui-screen-stack mx-auto w-full max-w-lg">
			{@render children?.()}
		</div>
	</div>

	{#if footer}
		<ActionBottomBar>
			{@render footer()}
		</ActionBottomBar>
	{/if}
</div>
