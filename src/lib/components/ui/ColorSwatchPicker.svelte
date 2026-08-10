<script lang="ts">
	import type { CoursePaletteEntry } from '$lib/parsers/course-palette';

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
</script>

<div class={['space-y-2', className]}>
	<span class="text-sm text-on-surface-variant">{label}</span>
	<div class="flex flex-wrap gap-2">
		{#each colors as color (color.background)}
			{@const isSelected = selectedBackground.toLowerCase() === color.background.toLowerCase()}
			<button
				type="button"
				class="h-[34px] w-[34px] rounded-[32px] border-2 {isSelected
					? 'border-brand'
					: 'border-transparent'}"
				style:background-color={color.background}
				aria-label={`选择颜色 ${color.background}`}
				aria-pressed={isSelected}
				onclick={() => onSelect(color.background, color.foreground)}
			></button>
		{/each}
	</div>
</div>
