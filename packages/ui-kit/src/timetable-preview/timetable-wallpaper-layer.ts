import type { Attachment } from 'svelte/attachments';

/** Wallpaper presentation shared by the shell and timetable previews. */

export type TimetableWallpaperFit = 'cover' | 'fill';

const WALLPAPER_BACKDROP_MOTION =
	'transition-[filter] will-change-[filter] motion-reduce:transition-none';

export function timetableWallpaperBackdropClass(blurred: boolean): string {
	const base = WALLPAPER_BACKDROP_MOTION;
	const duration = blurred ? 'duration-150' : 'duration-300';

	return blurred ? `${base} ${duration} blur-lg` : `${base} ${duration} blur-none`;
}

export function timetableWallpaperPreblurredClass(blurred: boolean): string {
	const base = 'blur-lg transition-opacity will-change-[opacity] motion-reduce:transition-none';
	const visibility = blurred ? 'opacity-100 duration-[120ms]' : 'opacity-[0.001] duration-[240ms]';
	return `${base} ${visibility}`;
}

export function attachWallpaperImageDecode(uri: string): Attachment<HTMLImageElement> {
	return (img) => {
		if (img.getAttribute('src') !== uri) img.src = uri;
		void img.decode?.().catch(() => {});
	};
}
