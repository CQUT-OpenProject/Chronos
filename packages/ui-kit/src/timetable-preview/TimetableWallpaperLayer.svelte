<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		timetableWallpaperBackdropClass,
		timetableWallpaperBackgroundSize,
		type TimetableWallpaperFit
	} from './timetable-wallpaper-layer';

	interface Props {
		wallpaperUri?: string | null;
		blurred?: boolean;
		/** `cover` for uncropped previews; `fill` for viewport-cropped wallpaper assets. */
		fit?: TimetableWallpaperFit;
		children?: Snippet;
	}

	let { wallpaperUri = null, blurred = false, fit = 'cover', children }: Props = $props();
</script>

<div class="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
	{#if wallpaperUri}
		<div
			class={timetableWallpaperBackdropClass(blurred, fit)}
			style:background-image={`url("${wallpaperUri}")`}
			style:background-size={timetableWallpaperBackgroundSize(fit)}
			style:background-position="center"
			style:background-repeat="no-repeat"
		></div>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>
