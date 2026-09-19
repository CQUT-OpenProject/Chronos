export function isShellWallpaperRevealed(input: {
	wallpaperUri: string | null | undefined;
	timetableSelected: boolean;
	hasTimetable: boolean;
}): boolean {
	return Boolean(input.wallpaperUri && input.timetableSelected && input.hasTimetable);
}
