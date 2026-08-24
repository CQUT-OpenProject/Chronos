<script lang="ts">
	import type { CoursePaletteEntry } from '@chronos/core';
	import { Check } from '$lib/icons';
	import Card from '$lib/components/ui/Card.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	let {
		label,
		colors,
		selectedBackground,
		onSelect,
		class: className = ''
	}: {
		label?: string;
		colors: readonly CoursePaletteEntry[];
		selectedBackground: string;
		onSelect: (index: number) => void;
		class?: string;
	} = $props();

	const controller = getAppController();
	const resolvedLabel = $derived(label ?? hostTextRead(controller, 'ui.color.label'));
	const labelId = `color-swatch-label-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class={['space-y-2', className]}>
	<span id={labelId} class="m3-field-label">{resolvedLabel}</span>
	<Card variant="outlined" class="!px-2 !py-2.5 sm:!p-3">
		<div
			class="flex w-full items-center justify-between gap-0.5 sm:gap-1"
			role="radiogroup"
			aria-labelledby={labelId}
		>
			{#each colors as color, index (color.background)}
				{@const isSelected = selectedBackground.toLowerCase() === color.background.toLowerCase()}
				<button
					type="button"
					class="flex aspect-square max-w-11 min-w-0 flex-1 items-center justify-center rounded-full transition-colors hover:bg-on-surface/5 active:bg-on-surface/10"
					role="radio"
					aria-checked={isSelected}
					aria-label={hostTextRead(controller, 'ui.color.selectAria', { color: color.background })}
					onclick={() => onSelect(index)}
				>
					<span
						class="relative flex size-7 items-center justify-center rounded-full border-2 transition-all sm:size-8 {isSelected
							? 'border-brand'
							: 'border-transparent'}"
						style:background-color={color.background}
					>
						{#if isSelected}
							<span style:color={color.foreground} class="flex items-center justify-center">
								<Check class="size-3.5 sm:size-4" aria-hidden="true" />
							</span>
						{/if}
					</span>
				</button>
			{/each}
		</div>
	</Card>
</div>
