<script lang="ts">
	import type { Snippet } from 'svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let {
		children,
		class: className = ''
	}: {
		children?: Snippet;
		class?: string;
	} = $props();
</script>

<Card
	variant="outlined"
	class="!divide-y divide-outline-variant/40 overflow-hidden !p-0 {className}"
>
	{@render children?.()}
</Card>
