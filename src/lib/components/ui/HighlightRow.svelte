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
	<div
		class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
	>
		<Icon class="h-5 w-5" />
	</div>
	<div class="flex min-w-0 flex-1 flex-col justify-center">
		<p class="m3-body-large font-normal text-on-surface">{title}</p>
		<p class="m3-body-medium text-xs text-on-surface-variant">{subtitle}</p>
	</div>
</li>
