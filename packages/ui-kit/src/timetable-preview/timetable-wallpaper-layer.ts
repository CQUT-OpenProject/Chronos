/** Shared wallpaper backdrop classes for production and preview layers. */

const WALLPAPER_BACKDROP_BASE =
	'absolute inset-[-24px] transition-[filter] will-change-[filter] motion-reduce:transition-none';

export function timetableWallpaperBackdropClass(blurred: boolean): string {
	const duration = blurred ? 'duration-150' : 'duration-300';

	return blurred
		? `${WALLPAPER_BACKDROP_BASE} ${duration} blur-lg`
		: `${WALLPAPER_BACKDROP_BASE} ${duration} blur-none`;
}
