<script lang="ts">
	import type { Component } from 'svelte';

	let {
		icon: Icon,
		title,
		subtitle
	}: {
		icon: Component<{ class?: string }>;
		title: string;
		subtitle: string;
	} = $props();
</script>

<li class="flex items-center gap-3.5">
	<span class="m3-leading-icon tone-primary" aria-hidden="true">
		<Icon />
	</span>
	<div class="flex min-w-0 flex-1 flex-col justify-center">
		<p class="m3-body-large text-on-surface">{title}</p>
		<p class="m3-body-small text-on-surface-variant">{subtitle}</p>
	</div>
</li>
