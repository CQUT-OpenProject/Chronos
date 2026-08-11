<script lang="ts">
	import type { CoursePaletteEntry } from '$lib/parsers/course-palette';
	import { Check } from '$lib/icons';
	import Card from '$lib/components/ui/Card.svelte';

	let {
		label = '课程颜色',
		colors,
		selectedBackground,
		onSelect,
		class: className = ''
	}: {
		label?: string;
		colors: CoursePaletteEntry[];
		selectedBackground: string;
		onSelect: (background: string, foreground: string) => void;
		class?: string;
	} = $props();

	const labelId = `color-swatch-label-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class={['space-y-2', className]}>
	<span id={labelId} class="m3-field-label">{label}</span>
	<Card variant="outlined" class="!p-3">
		<div
			class="flex flex-wrap items-center justify-center gap-1"
			role="radiogroup"
			aria-labelledby={labelId}
		>
			{#each colors as color (color.background)}
				{@const isSelected = selectedBackground.toLowerCase() === color.background.toLowerCase()}
				<button
					type="button"
					class="flex size-12 items-center justify-center rounded-full transition-colors hover:bg-on-surface/5 active:bg-on-surface/10"
					role="radio"
					aria-checked={isSelected}
					aria-label={`选择颜色 ${color.background}`}
					onclick={() => onSelect(color.background, color.foreground)}
				>
					<span
						class="relative flex size-8 items-center justify-center rounded-full border-2 {isSelected
							? 'border-brand'
							: 'border-transparent'}"
						style:background-color={color.background}
					>
						{#if isSelected}
							<span style:color={color.foreground} class="flex items-center justify-center">
								<Check class="size-4" aria-hidden="true" />
							</span>
						{/if}
					</span>
				</button>
			{/each}
		</div>
	</Card>
</div>
