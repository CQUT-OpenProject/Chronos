/** Shared wallpaper backdrop classes for production and preview layers. */

export type TimetableWallpaperFit = 'cover' | 'fill';

const WALLPAPER_BACKDROP_MOTION =
	'transition-[filter] will-change-[filter] motion-reduce:transition-none';

export function timetableWallpaperBackdropClass(
	blurred: boolean,
	fit: TimetableWallpaperFit = 'cover'
): string {
	const inset = fit === 'cover' ? 'inset-[-24px]' : 'inset-0';
	const base = `absolute ${inset} ${WALLPAPER_BACKDROP_MOTION}`;
	const duration = blurred ? 'duration-150' : 'duration-300';

	return blurred ? `${base} ${duration} blur-lg` : `${base} ${duration} blur-none`;
}

export function timetableWallpaperBackgroundSize(fit: TimetableWallpaperFit = 'cover'): string {
	return fit === 'cover' ? 'cover' : '100% 100%';
}
