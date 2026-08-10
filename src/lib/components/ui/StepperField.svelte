<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	let {
		label,
		value = $bindable(0),
		min = 0,
		max = 100,
		onchange,
		class: className = ''
	}: {
		label: string;
		value?: number;
		min?: number;
		max?: number;
		onchange?: (value: number) => void;
		class?: string;
	} = $props();

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
		'flex items-center justify-between rounded-lg border border-outline px-3 py-2 dark:border-outline-variant',
		className
	]}
>
	<span class="m3-body-medium">{label}</span>
	<div class="flex items-center gap-2">
		<Button
			variant="text"
			class="size-8 min-w-8 px-0"
			aria-label={`减少${label}`}
			disabled={value <= min}
			onclick={() => step(-1)}
		>
			-
		</Button>
		<span class="m3-body-large">{value}</span>
		<Button
			variant="text"
			class="size-8 min-w-8 px-0"
			aria-label={`增加${label}`}
			disabled={value >= max}
			onclick={() => step(1)}
		>
			+
		</Button>
	</div>
</div>
