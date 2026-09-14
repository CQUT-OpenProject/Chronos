<script lang="ts">
	import { haptic } from '../haptic/haptic';
	import type { Segment } from './segmented-control';

	let {
		segments,
		value,
		onValueChange,
		class: className = '',
		animateThumb = true
	}: {
		segments: Segment[];
		value: string;
		onValueChange: (value: string) => void;
		class?: string;
		animateThumb?: boolean;
	} = $props();

	const selectedIndex = $derived(segments.findIndex((segment) => segment.value === value));
	const segmentCount = $derived(segments.length);
	const safeIndex = $derived(selectedIndex < 0 ? 0 : selectedIndex);

	function handleSegmentClick(segmentValue: string) {
		if (segmentValue !== value) {
			haptic.medium();
		}
		onValueChange(segmentValue);
	}

	function handleSegmentKeydown(event: KeyboardEvent, index: number) {
		if (segmentCount <= 1) return;
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		const direction = event.key === 'ArrowRight' ? 1 : -1;
		const nextIndex = (index + direction + segmentCount) % segmentCount;
		const nextValue = segments[nextIndex]?.value;
		if (nextValue) handleSegmentClick(nextValue);
	}
</script>

<div class="ui-segmented-track {className}" role="tablist">
	{#if segmentCount > 0 && selectedIndex >= 0}
		<div
			class="ui-segmented-thumb {animateThumb
				? 'transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]'
				: ''}"
			style:left="calc(0.375rem + {safeIndex} * ((100% - 0.75rem) / {segmentCount}))"
			style:width="calc((100% - 0.75rem) / {segmentCount})"
			aria-hidden="true"
		></div>
	{/if}

	{#each segments as segment, index (segment.value)}
		<button
			type="button"
			role="tab"
			aria-selected={value === segment.value}
			tabindex={value === segment.value ? 0 : -1}
			class="text-label-large rounded-pill relative z-10 flex-1 cursor-pointer py-2 text-center transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 {value ===
			segment.value
				? 'text-on-secondary-container'
				: 'text-on-surface-variant hover:text-on-surface'}"
			onclick={() => handleSegmentClick(segment.value)}
			onkeydown={(event) => handleSegmentKeydown(event, index)}
		>
			{segment.label}
		</button>
	{/each}
</div>
