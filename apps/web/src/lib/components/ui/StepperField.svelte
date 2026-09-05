<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import { Add, Remove } from '$lib/icons';

	let {
		label,
		value = $bindable(0),
		min = 0,
		max = 100,
		embedded = false,
		onchange,
		class: className = ''
	}: {
		label: string;
		value?: number;
		min?: number;
		max?: number;
		embedded?: boolean;
		onchange?: (value: number) => void;
		class?: string;
	} = $props();

	const decreaseAriaLabel = $derived(hostT('ui.stepper.decrease', { label }));
	const increaseAriaLabel = $derived(hostT('ui.stepper.increase', { label }));

	function clamp(next: number) {
		return Math.min(Math.max(next, min), max);
	}

	function step(delta: number) {
		const next = clamp(value + delta);
		value = next;
		onchange?.(next);
	}
</script>

<div
	class={[
		embedded
			? 'ui-form-field ui-form-field--embedded'
			: 'flex items-center justify-between rounded-lg border border-outline px-3 py-2 dark:border-outline-variant',
		className
	]}
>
	<span class={embedded ? 'ui-field-label' : 'text-body-medium'}>{label}</span>
	<div class="flex items-center gap-1">
		<IconButton
			variant="tonal"
			size="sm"
			class="!p-2"
			ariaLabel={decreaseAriaLabel}
			disabled={value <= min}
			onclick={() => step(-1)}
		>
			<Remove class="size-5" />
		</IconButton>
		<span class="text-body-large min-w-8 text-center tabular-nums">{value}</span>
		<IconButton
			variant="tonal"
			size="sm"
			class="!p-2"
			ariaLabel={increaseAriaLabel}
			disabled={value >= max}
			onclick={() => step(1)}
		>
			<Add class="size-5" />
		</IconButton>
	</div>
</div>
