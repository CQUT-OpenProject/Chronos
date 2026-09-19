<script lang="ts">
	import {
		attachWallpaperImageDecode,
		type TimetableWallpaperFit
	} from './timetable-wallpaper-layer';

	let {
		uri,
		fit = 'cover',
		class: className = ''
	}: {
		uri: string;
		fit?: TimetableWallpaperFit;
		class?: string;
	} = $props();
</script>

<img
	alt=""
	class={['wallpaper-image', fit === 'cover' && 'wallpaper-image--cover', className]}
	decoding="async"
	src={uri}
	style:object-fit={fit}
	{@attach attachWallpaperImageDecode(uri)}
/>

<style>
	.wallpaper-image {
		pointer-events: none;
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		object-position: center;
	}

	.wallpaper-image--cover {
		inset: -24px;
		width: calc(100% + 48px);
		height: calc(100% + 48px);
	}
</style>
