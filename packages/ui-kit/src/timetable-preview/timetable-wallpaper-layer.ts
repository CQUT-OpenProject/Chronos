/** Shared wallpaper backdrop classes for production and preview layers. */

export type TimetableWallpaperFit = 'cover' | 'fill';

const WALLPAPER_BACKDROP_MOTION =
	'transition-[filter] will-change-[filter] motion-reduce:transition-none';

function wallpaperInset(fit: TimetableWallpaperFit): string {
	return fit === 'cover' ? 'inset-[-24px]' : 'inset-0';
}

export function timetableWallpaperBackdropClass(
	blurred: boolean,
	fit: TimetableWallpaperFit = 'cover'
): string {
	const base = `pointer-events-none absolute ${wallpaperInset(fit)} ${WALLPAPER_BACKDROP_MOTION}`;
	const duration = blurred ? 'duration-150' : 'duration-300';

	return blurred ? `${base} ${duration} blur-lg` : `${base} ${duration} blur-none`;
}

export function timetableWallpaperClearClass(fit: TimetableWallpaperFit = 'cover'): string {
	return `pointer-events-none absolute ${wallpaperInset(fit)}`;
}

export function timetableWallpaperPreblurredClass(
	blurred: boolean,
	fit: TimetableWallpaperFit = 'cover'
): string {
	const base = `${timetableWallpaperClearClass(fit)} blur-lg transition-opacity will-change-[opacity] motion-reduce:transition-none`;
	const visibility = blurred ? 'opacity-100 duration-[120ms]' : 'opacity-[0.001] duration-[240ms]';
	return `${base} ${visibility}`;
}

export function timetableWallpaperBackgroundSize(fit: TimetableWallpaperFit = 'cover'): string {
	return fit === 'cover' ? 'cover' : '100% 100%';
}
