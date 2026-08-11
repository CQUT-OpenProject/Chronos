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

<header class="m3-top-app-bar {className}">
	{#if leading}
		<div class="m3-top-app-bar-leading">
			{@render leading()}
		</div>
	{/if}
	<div class="m3-top-app-bar-title">
		{#if titleSnippet}
			{@render titleSnippet()}
		{:else if title}
			<h1 class="m3-headline-small font-medium">{title}</h1>
		{/if}
	</div>
	{#if actions}
		<div class="m3-top-app-bar-actions">
			{@render actions()}
		</div>
	{/if}
</header>
