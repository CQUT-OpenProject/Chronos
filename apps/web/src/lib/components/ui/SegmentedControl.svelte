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
	const segmentWidthPercent = $derived(segmentCount > 0 ? 100 / segmentCount : 100);
</script>

<div class="relative flex w-full rounded-full border border-border bg-surface p-1.5 shadow-xs">
	<div
		class="absolute top-1.5 bottom-1.5 rounded-full bg-secondary-container shadow-xs transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
		style:left="calc({selectedIndex * segmentWidthPercent}% - {selectedIndex * 0.25}rem + 0.5rem)"
		style:width="calc({segmentWidthPercent}% - 0.5rem)"
	></div>

	{#each segments as segment (segment.value)}
		<button
			type="button"
			class="m3-label-large relative z-10 flex-1 cursor-pointer rounded-full py-2 text-center transition-colors duration-200 {value ===
			segment.value
				? 'text-on-secondary-container'
				: 'text-on-surface-variant hover:text-on-surface'}"
			onclick={() => onValueChange(segment.value)}
		>
			{segment.label}
		</button>
	{/each}
</div>
