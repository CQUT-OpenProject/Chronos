<script lang="ts">
	import type { Snippet } from 'svelte';
	import TimetableWallpaperImage from './TimetableWallpaperImage.svelte';
	import {
		timetableWallpaperBackdropClass,
		timetableWallpaperPreblurredClass,
		type TimetableWallpaperFit
	} from './timetable-wallpaper-layer';

	interface Props {
		wallpaperUri?: string | null;
		blurred?: boolean;
		/** Keep a blurred copy painted before entering edit mode. */
		prewarmBlur?: boolean;
		/** `cover` preserves image proportions across viewport sizes; `fill` stretches to exact bounds. */
		fit?: TimetableWallpaperFit;
		children?: Snippet;
	}

	let {
		wallpaperUri = null,
		blurred = false,
		prewarmBlur = false,
		fit = 'cover',
		children
	}: Props = $props();
</script>

<div class="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
	{#if wallpaperUri}
		{#if prewarmBlur}
			<TimetableWallpaperImage uri={wallpaperUri} {fit} />
			<TimetableWallpaperImage
				uri={wallpaperUri}
				{fit}
				class="timetable-wallpaper-preblurred {timetableWallpaperPreblurredClass(blurred)}"
			/>
		{:else}
			<TimetableWallpaperImage
				uri={wallpaperUri}
				{fit}
				class={timetableWallpaperBackdropClass(blurred)}
			/>
		{/if}
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	:global(:root.reduce-motion .timetable-wallpaper-preblurred) {
		transition: none;
	}
</style>
