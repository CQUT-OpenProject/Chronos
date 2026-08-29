<script lang="ts">
	type Segment = {
		value: string;
		label: string;
	};

	let {
		segments,
		value,
		onValueChange
	}: {
		segments: Segment[];
		value: string;
		onValueChange: (value: string) => void;
	} = $props();

	const selectedIndex = $derived(segments.findIndex((segment) => segment.value === value));
	const segmentCount = $derived(segments.length);
	const safeIndex = $derived(selectedIndex < 0 ? 0 : selectedIndex);
</script>

<div class="rounded-pill relative flex w-full border border-border bg-surface p-1.5 shadow-xs">
	{#if segmentCount > 0 && selectedIndex >= 0}
		<div
			class="rounded-pill absolute top-1.5 bottom-1.5 bg-secondary-container shadow-xs transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
			style:left="calc(0.375rem + {safeIndex} * ((100% - 0.75rem) / {segmentCount}))"
			style:width="calc((100% - 0.75rem) / {segmentCount})"
		></div>
	{/if}

	{#each segments as segment (segment.value)}
		<button
			type="button"
			class="m3-label-large rounded-pill relative z-10 flex-1 cursor-pointer py-2 text-center transition-colors duration-200 {value ===
			segment.value
				? 'text-on-secondary-container'
				: 'text-on-surface-variant hover:text-on-surface'}"
			onclick={() => onValueChange(segment.value)}
		>
			{segment.label}
		</button>
	{/each}
</div>
