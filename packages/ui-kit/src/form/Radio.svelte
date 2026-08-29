<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		checked = $bindable(false),
		disabled = false,
		name,
		value,
		onchange,
		class: className = '',
		...props
	}: {
		checked?: boolean;
		disabled?: boolean;
		name?: string;
		value?: string;
		onchange?: (event: Event) => void;
		class?: string;
	} & HTMLInputAttributes = $props();
</script>

<div
	class="rounded-circular relative flex size-10 items-center justify-center transition-colors {disabled
		? ''
		: 'focus-within:bg-on-surface/10 hover:bg-on-surface/5'} {className}"
>
	<input
		type="radio"
		{name}
		{value}
		{checked}
		{disabled}
		{onchange}
		{...props}
		class="peer sr-only"
	/>
	<div
		class="rounded-circular relative flex size-5 items-center justify-center border-2 transition-colors duration-200 {disabled
			? 'border-on-surface/38'
			: checked
				? 'border-brand'
				: 'border-on-surface-variant/70'}"
	>
		<div
			class="rounded-circular size-2.5 {disabled
				? 'bg-on-surface/38'
				: 'bg-brand'} transition-transform duration-200 ease-out {checked
				? 'scale-100'
				: 'scale-0'}"
		></div>
	</div>
</div>
