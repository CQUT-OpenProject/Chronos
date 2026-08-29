<script lang="ts">
	let {
		title,
		children
	}: {
		title: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<section class="ui-section">
	<h2 class="ui-section-title">{title}</h2>
	<div class="ui-section-surface">
		{@render children?.()}
	</div>
</section>
