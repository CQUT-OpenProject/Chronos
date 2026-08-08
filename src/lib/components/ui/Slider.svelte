<script lang="ts">
	import { Slider } from 'bits-ui';

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		onValueChange,
		onValueCommit,
		class: className = ''
	}: {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
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
	{value}
	onValueChange={handleValueChange}
	onValueCommit={handleValueCommit}
	{min}
	{max}
	{step}
	class="relative flex w-full touch-none items-center py-3 select-none {className}"
>
	<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary-container">
		<Slider.Range class="absolute h-full bg-brand" />
	</span>
	<Slider.Thumb
		index={0}
		class="block size-5 rounded-full bg-brand shadow-md transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand active:scale-125"
	/>
</Slider.Root>
