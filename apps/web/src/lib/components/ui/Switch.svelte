<script lang="ts">
	import { Switch } from 'bits-ui';

	let {
		checked = $bindable(false),
		disabled = false,
		size = 'default',
		onCheckedChange,
		class: className = ''
	}: {
		checked?: boolean;
		disabled?: boolean;
		size?: 'default' | 'sm';
		onCheckedChange?: (checked: boolean) => void;
		class?: string;
	} = $props();

	const rootSizeClass = $derived(size === 'sm' ? 'h-6 w-10 p-0.5' : 'h-8 w-[3.25rem] p-0.5');
	const thumbSizeClass = $derived(
		size === 'sm'
			? 'size-5 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
			: 'size-6 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
	);
</script>

<Switch.Root
	bind:checked
	{disabled}
	{onCheckedChange}
	class="peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-outline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-brand {rootSizeClass} {className}"
>
	<Switch.Thumb
		class="pointer-events-none block rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18),0_1px_1px_rgba(0,0,0,0.08)] transition-transform {thumbSizeClass}"
	/>
</Switch.Root>
