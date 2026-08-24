<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

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

	const controller = getAppController();
	const decreaseAriaLabel = $derived(hostTextRead(controller, 'ui.stepper.decrease', { label }));
	const increaseAriaLabel = $derived(hostTextRead(controller, 'ui.stepper.increase', { label }));

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
			? 'm3-form-field m3-form-field--embedded'
			: 'flex items-center justify-between rounded-lg border border-outline px-3 py-2 dark:border-outline-variant',
		className
	]}
>
	<span class={embedded ? 'm3-field-label' : 'm3-body-medium'}>{label}</span>
	<div class="flex items-center gap-2">
		<Button
			variant="text"
			class="size-8 min-w-8 px-0"
			aria-label={decreaseAriaLabel}
			disabled={value <= min}
			onclick={() => step(-1)}
		>
			-
		</Button>
		<span class="m3-body-large">{value}</span>
		<Button
			variant="text"
			class="size-8 min-w-8 px-0"
			aria-label={increaseAriaLabel}
			disabled={value >= max}
			onclick={() => step(1)}
		>
			+
		</Button>
	</div>
</div>
