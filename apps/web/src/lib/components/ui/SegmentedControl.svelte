<script lang="ts">
	import { SegmentedControl as UiSegmentedControl } from '@chronos/ui-kit';

	type Segment = {
		value: string;
		label: string;
	};

	let {
		segments,
		value,
		onValueChange,
		class: className = ''
	}: {
		segments: Segment[];
		value: string;
		onValueChange: (value: string) => void;
		class?: string;
	} = $props();
</script>

<UiSegmentedControl {segments} {value} {onValueChange} class={className} />
