<script lang="ts">
	let {
		title,
		children
	}: {
		title: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<section class="m3-section">
	<h2 class="m3-section-title">{title}</h2>
	<div class="m3-section-surface">
		{@render children?.()}
	</div>
</section>
