<script lang="ts">
	import { Switch } from 'bits-ui';

	let {
		checked = $bindable(false),
		disabled = false,
		onCheckedChange,
		class: className = ''
	}: {
		checked?: boolean;
		disabled?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		class?: string;
	} = $props();
</script>

<Switch.Root
	bind:checked
	{disabled}
	{onCheckedChange}
	class="peer inline-flex h-8 w-[3.25rem] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-outline p-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-brand {className}"
>
	<Switch.Thumb
		class="pointer-events-none block size-6 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18),0_1px_1px_rgba(0,0,0,0.08)] transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
	/>
</Switch.Root>
