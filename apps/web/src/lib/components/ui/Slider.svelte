<script lang="ts">
	import { Slider } from 'bits-ui';

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		stops = false,
		id,
		ariaLabel,
		onValueChange,
		onValueCommit,
		class: className = ''
	}: {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		stops?: boolean;
		id?: string;
		ariaLabel?: string;
		onValueChange?: (val: number) => void;
		onValueCommit?: (val: number) => void;
		class?: string;
	} = $props();

	function handleValueChange(vals: number) {
		value = vals;
		onValueChange?.(vals);
	}

	function handleValueCommit(vals: number) {
		onValueCommit?.(vals);
	}
</script>

<Slider.Root
	type="single"
	{id}
	aria-label={ariaLabel}
	{value}
	onValueChange={handleValueChange}
	onValueCommit={handleValueCommit}
	{min}
	{max}
	{step}
	class="relative flex h-7 w-full touch-none items-center py-1 select-none {className}"
>
	{#snippet children({ tickItems })}
		<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary-container">
			<Slider.Range class="absolute h-full bg-brand" />
			{#if stops}
				{#each tickItems as tick (tick.index)}
					<Slider.Tick
						index={tick.index}
						class="pointer-events-none absolute top-1/2 -mt-0.5 size-1 rounded-full bg-brand transition-colors data-[bounded]:bg-secondary-container"
					/>
				{/each}
			{/if}
		</span>
		<Slider.Thumb
			index={0}
			class="block size-5 rounded-full bg-brand shadow-md transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand active:scale-125"
		/>
	{/snippet}
</Slider.Root>
