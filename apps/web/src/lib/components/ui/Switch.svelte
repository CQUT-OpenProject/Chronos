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

	const rootSizeClass = $derived(
		size === 'sm'
			? 'h-6 w-10 overflow-hidden p-0.5 [--switch-travel:calc(2.5rem-22px-0.5rem)]'
			: 'h-8 w-[3.25rem] overflow-hidden p-0.5 [--switch-travel:calc(3.25rem-1.75rem-0.5rem)]'
	);
	const thumbSizeClass = $derived(
		size === 'sm'
			? 'h-5 w-[22px] shrink-0 rounded-pill data-[state=checked]:translate-x-[var(--switch-travel)] data-[state=unchecked]:translate-x-0'
			: 'h-6 w-7 shrink-0 rounded-pill data-[state=checked]:translate-x-[var(--switch-travel)] data-[state=unchecked]:translate-x-0'
	);
</script>

<Switch.Root
	bind:checked
	{disabled}
	{onCheckedChange}
	class="peer rounded-pill inline-flex shrink-0 cursor-pointer items-center border-2 border-transparent bg-outline transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-brand {rootSizeClass} {className}"
>
	<Switch.Thumb
		class="rounded-pill pointer-events-none block bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18),0_1px_1px_rgba(0,0,0,0.08)] transition-transform duration-200 ease-out {thumbSizeClass}"
	/>
</Switch.Root>
