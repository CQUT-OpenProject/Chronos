<script lang="ts">
	let {
		title,
		subtitle = '',
		titleId
	}: {
		title: string;
		subtitle?: string;
		titleId?: string;
	} = $props();
</script>

<div class="flex flex-col items-center gap-3 py-4 text-center">
	<img
		src="/chronos-icon.svg"
		alt="Chronos"
		class="h-20 w-20 rounded-2xl shadow-md ring-1 ring-black/5 dark:ring-white/10"
	/>
	<div class="flex flex-col items-center gap-1">
		<h1 id={titleId} class="m3-headline-small font-semibold text-on-surface">{title}</h1>
		{#if subtitle}
			<p class="m3-body-small text-on-surface-variant">{subtitle}</p>
		{/if}
	</div>
</div>
