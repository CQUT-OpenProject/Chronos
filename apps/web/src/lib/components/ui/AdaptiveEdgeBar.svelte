<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		kind,
		top,
		content,
		bottom,
		alert = false
	}: {
		kind: 'shell' | 'secondary';
		top?: Snippet;
		content?: Snippet;
		bottom?: Snippet;
		alert?: boolean;
	} = $props();
</script>

<div class="adaptive-edge-bar adaptive-edge-bar--{kind}" class:alert>
	<div class="adaptive-edge-bar-top">
		{@render top?.()}
	</div>
	<div class="adaptive-edge-bar-content">
		{@render content?.()}
	</div>
	<div class="adaptive-edge-bar-bottom">
		{@render bottom?.()}
	</div>
</div>
