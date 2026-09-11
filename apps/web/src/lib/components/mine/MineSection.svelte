<script lang="ts">
	let {
		title,
		children
	}: {
		title?: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<section class="ui-section">
	{#if title}
		<h2 class="ui-section-title">{title}</h2>
	{/if}
	<div class="ui-section-surface">
		{@render children?.()}
	</div>
</section>
