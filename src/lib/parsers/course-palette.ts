import { PaletteMode } from '$lib/models/app-state';

export type CoursePaletteEntry = { background: string; foreground: string };

const COURSE_PALETTE: [string, string][] = [
	['#EADDFF', '#21005D'],
	['#FFDBC9', '#311100'],
	['#C4EED0', '#072711'],
	['#D3E3FD', '#041E49'],
	['#FFD8E4', '#31111D'],
	['#F6E1B0', '#241A00']
];

const EASTER_EGG_COURSE_BACKGROUNDS = [
	'#FFEE55',
	'#FFBBCC',
	'#4477CC',
	'#9977CC',
	'#EE5577',
	'#4D5B4C'
] as const;

export const COURSE_PALETTE_ENTRIES: CoursePaletteEntry[] = COURSE_PALETTE.map(
	([background, foreground]) => ({ background, foreground })
);

const WHITESPACE_REGEX = /\s+/g;

export function kotlinStringHashCode(value: string): number {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) | 0;
	}
	return hash;
}

export function normalizedCourseName(value: string): string {
	return value
		.replace(/^【调】/, '')
		.replace(/[★☆〇■◆]$/u, '')
		.trim()
		.replace(WHITESPACE_REGEX, ' ');
}

export function coursePalette(name: string): [string, string] {
	const index = Math.abs(kotlinStringHashCode(name) % COURSE_PALETTE.length);
	return COURSE_PALETTE[index] ?? COURSE_PALETTE[0]!;
}

const DEFAULT_PALETTE_BACKGROUNDS = new Set(
	COURSE_PALETTE.map(([background]) => background.toLowerCase())
);

function onColorForBackground(hex: string): string {
	return relativeLuminance(hex) > 0.55 ? '#1a1a1a' : '#fff';
}

function relativeLuminance(hex: string): number {
	const value = Number.parseInt(hex.slice(1), 16);
	const channel = (shift: number) => {
		const srgb = ((value >> shift) & 255) / 255;
		return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

export const EASTER_EGG_PALETTE_ENTRIES: CoursePaletteEntry[] = EASTER_EGG_COURSE_BACKGROUNDS.map(
	(background) => ({ background, foreground: onColorForBackground(background) })
);

export function resolveCoursePalette(
	paletteMode: PaletteMode,
	wallpaperPalette: readonly CoursePaletteEntry[] | null | undefined
): readonly CoursePaletteEntry[] {
	if (paletteMode === PaletteMode.RANDOM) return EASTER_EGG_PALETTE_ENTRIES;
	if (paletteMode === PaletteMode.WALLPAPER && wallpaperPalette && wallpaperPalette.length > 0) {
		return wallpaperPalette;
	}
	return COURSE_PALETTE_ENTRIES;
}

export function displaySwatchBackground(
	storedBackground: string,
	displayPalette: readonly CoursePaletteEntry[]
): string {
	const index = COURSE_PALETTE_ENTRIES.findIndex(
		(entry) => entry.background.toLowerCase() === storedBackground.trim().toLowerCase()
	);
	if (index < 0) return storedBackground;
	return displayPalette[index % displayPalette.length]?.background ?? storedBackground;
}

export function assignCourseDisplayColors(
	courses: { name: string; color: string }[],
	palette: readonly CoursePaletteEntry[] = COURSE_PALETTE_ENTRIES
): Map<string, CoursePaletteEntry> {
	const names = [
		...new Set(
			courses
				.filter((course) => DEFAULT_PALETTE_BACKGROUNDS.has(course.color.trim().toLowerCase()))
				.map((course) => normalizedCourseName(course.name))
		)
	];
	names.sort(
		(left, right) =>
			kotlinStringHashCode(left) - kotlinStringHashCode(right) || left.localeCompare(right)
	);
	return new Map(names.map((name, index) => [name, palette[index % palette.length]!]));
}
