<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="bottom-bar w-full">
	<div class="mx-auto flex h-full w-full max-w-lg items-center">
		{@render children?.()}
	</div>
</div>
