<script lang="ts">
	import { TimetableWallpaperImage, timetableWallpaperPreblurredClass } from '@chronos/ui-kit';

	let {
		uri,
		revealed,
		blurred = false
	}: {
		uri: string;
		revealed: boolean;
		blurred?: boolean;
	} = $props();
</script>

<div
	class="shell-wallpaper"
	data-shell-wallpaper
	data-revealed={revealed ? 'true' : 'false'}
	style:opacity={revealed ? '1' : '0.001'}
	aria-hidden="true"
>
	<TimetableWallpaperImage {uri} />
	<TimetableWallpaperImage
		{uri}
		class="timetable-wallpaper-preblurred {timetableWallpaperPreblurredClass(blurred)}"
	/>
</div>

<style>
	:global(:root.reduce-motion .shell-wallpaper .timetable-wallpaper-preblurred) {
		transition: none;
	}
</style>
