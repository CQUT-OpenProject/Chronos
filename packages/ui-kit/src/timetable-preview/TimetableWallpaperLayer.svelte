<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		timetableWallpaperBackdropClass,
		timetableWallpaperBackgroundSize,
		timetableWallpaperClearClass,
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
			<div
				class={timetableWallpaperClearClass(fit)}
				style:background-image={`url("${wallpaperUri}")`}
				style:background-size={timetableWallpaperBackgroundSize(fit)}
				style:background-position="center"
				style:background-repeat="no-repeat"
			></div>
			<div
				class="timetable-wallpaper-preblurred {timetableWallpaperPreblurredClass(blurred, fit)}"
				style:background-image={`url("${wallpaperUri}")`}
				style:background-size={timetableWallpaperBackgroundSize(fit)}
				style:background-position="center"
				style:background-repeat="no-repeat"
			></div>
		{:else}
			<div
				class={timetableWallpaperBackdropClass(blurred, fit)}
				style:background-image={`url("${wallpaperUri}")`}
				style:background-size={timetableWallpaperBackgroundSize(fit)}
				style:background-position="center"
				style:background-repeat="no-repeat"
			></div>
		{/if}
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	:global(:root.reduce-motion) .timetable-wallpaper-preblurred {
		transition: none;
	}
</style>
