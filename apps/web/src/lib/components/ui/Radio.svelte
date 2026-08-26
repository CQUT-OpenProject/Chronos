<script lang="ts">
	import { Radio as UiRadio } from '@chronos/ui-kit';
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

<UiRadio bind:checked {disabled} {name} {value} {onchange} class={className} {...props} />
