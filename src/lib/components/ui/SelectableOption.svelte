<script lang="ts">
	import Radio from '$lib/components/ui/Radio.svelte';

	let {
		name,
		selected,
		onclick,
		label,
		description
	}: {
		name: string;
		selected: boolean;
		onclick: () => void;
		label: string;
		description?: string;
	} = $props();
</script>

<button
	type="button"
	class="flex min-h-[56px] w-full cursor-pointer items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition-colors duration-200 {selected
		? 'border-brand bg-primary-container/30 shadow-xs dark:border-soft-blue'
		: 'border-outline-variant/60 bg-surface hover:bg-surface-variant/30'}"
	{onclick}
>
	<Radio {name} checked={selected} />
	<div class="flex flex-col justify-center">
		<span class="m3-body-large font-medium text-on-surface">{label}</span>
		{#if description}
			<span class="m3-body-small mt-0.5 text-on-surface-variant">{description}</span>
		{/if}
	</div>
</button>
