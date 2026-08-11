<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<div class="bottom-bar w-full">
	<div class="mx-auto w-full max-w-lg">
		{@render children?.()}
	</div>
</div>
