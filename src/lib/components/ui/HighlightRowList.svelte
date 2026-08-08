<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';

	let { children }: { children?: import('svelte').Snippet } = $props();
</script>

<Card variant="outlined">
	<ul class="flex flex-col gap-4 text-on-surface-variant">
		{@render children?.()}
	</ul>
</Card>
