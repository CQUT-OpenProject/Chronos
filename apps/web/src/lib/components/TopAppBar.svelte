<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		titleSnippet,
		leading,
		actions,
		class: className = ''
	}: {
		title?: string;
		titleSnippet?: Snippet;
		leading?: Snippet;
		actions?: Snippet;
		class?: string;
	} = $props();
</script>

<header class="ui-shell-top-bar {className}">
	{#if leading}
		<div class="ui-shell-top-bar-leading">
			{@render leading()}
		</div>
	{/if}
	<div class="ui-shell-top-bar-title">
		{#if titleSnippet}
			{@render titleSnippet()}
		{:else if title}
			<h1 class="text-headline-small truncate font-medium">
				{title}
			</h1>
		{/if}
	</div>
	{#if actions}
		<div class="ui-shell-top-bar-actions">
			{@render actions()}
		</div>
	{/if}
</header>
