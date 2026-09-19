<script lang="ts">
	import type { Snippet } from 'svelte';
	import TimetableWallpaperImage from './TimetableWallpaperImage.svelte';
	import {
		timetableWallpaperBackdropClass,
		type TimetableWallpaperFit
	} from './timetable-wallpaper-layer';

	interface Props {
		wallpaperUri?: string | null;
		blurred?: boolean;
		/** `cover` preserves image proportions across viewport sizes; `fill` stretches to exact bounds. */
		fit?: TimetableWallpaperFit;
		children?: Snippet;
	}

	let { wallpaperUri = null, blurred = false, fit = 'cover', children }: Props = $props();
</script>

<div class="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
	{#if wallpaperUri}
		<TimetableWallpaperImage
			uri={wallpaperUri}
			{fit}
			class={timetableWallpaperBackdropClass(blurred)}
		/>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>
