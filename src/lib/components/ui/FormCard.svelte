<script lang="ts">
	import type { Snippet } from 'svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let {
		variant = 'outlined',
		children,
		class: className = ''
	}: {
		variant?: 'outlined' | 'plain';
		children?: Snippet;
		class?: string;
	} = $props();
</script>

{#if variant === 'plain'}
	<div class={className}>
		{@render children?.()}
	</div>
{:else}
	<Card
		variant="outlined"
		class="!divide-y divide-outline-variant/40 overflow-hidden !p-0 {className}"
	>
		{@render children?.()}
	</Card>
{/if}
