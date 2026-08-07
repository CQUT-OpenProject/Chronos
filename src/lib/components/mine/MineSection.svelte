<script lang="ts">
	let {
		title,
		accentColor = 'primary',
		children
	}: {
		title: string;
		accentColor?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
		children?: import('svelte').Snippet;
	} = $props();
</script>

<section class="m3-section tone-{accentColor}">
	<h2 class="m3-section-title">{title}</h2>
	<div class="m3-section-surface">
		{@render children?.()}
	</div>
</section>
