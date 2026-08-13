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

export function defaultPaletteSlot(hex: string): number | null {
	const normalized = hex.trim().toLowerCase();
	const index = COURSE_PALETTE_ENTRIES.findIndex(
		(entry) => entry.background.toLowerCase() === normalized
	);
	return index < 0 ? null : index;
}

export function persistSwatchSelection(displayIndex: number): CoursePaletteEntry {
	return COURSE_PALETTE_ENTRIES[displayIndex] ?? COURSE_PALETTE_ENTRIES[0]!;
}

export function resolveCoursePaint(
	stored: { color: string; textColor: string },
	displayPalette: readonly CoursePaletteEntry[]
): { background: string; foreground: string } {
	const slot = defaultPaletteSlot(stored.color);
	if (slot == null || displayPalette.length === 0) {
		return { background: stored.color, foreground: stored.textColor };
	}
	return displayPalette[slot % displayPalette.length]!;
}

/** Spread automatic (default-slot) courses across the display palette. */
export function assignCourseDisplayColors(
	courses: { name: string; color: string }[],
	palette: readonly CoursePaletteEntry[] = COURSE_PALETTE_ENTRIES
): Map<string, CoursePaletteEntry> {
	if (palette.length === 0) return new Map();

	const preferred = new Map<string, number>();
	for (const course of courses) {
		const slot = defaultPaletteSlot(course.color);
		if (slot == null) continue;
		const name = normalizedCourseName(course.name);
		if (!preferred.has(name)) preferred.set(name, slot);
	}

	const names = [...preferred.keys()].sort(
		(left, right) =>
			kotlinStringHashCode(left) - kotlinStringHashCode(right) || left.localeCompare(right)
	);

	const assigned = new Map<string, CoursePaletteEntry>();
	const occupied = new Set<number>();
	const deferred: string[] = [];

	for (const name of names) {
		const slot = preferred.get(name)! % palette.length;
		if (occupied.has(slot)) {
			deferred.push(name);
			continue;
		}
		occupied.add(slot);
		assigned.set(name, palette[slot]!);
	}

	let next = 0;
	for (const name of deferred) {
		while (occupied.has(next % palette.length) && occupied.size < palette.length) {
			next += 1;
		}
		const slot = next % palette.length;
		occupied.add(slot);
		assigned.set(name, palette[slot]!);
		next += 1;
	}

	return assigned;
}

export function displaySwatchBackground(
	storedBackground: string,
	displayPalette: readonly CoursePaletteEntry[]
): string {
	return resolveCoursePaint({ color: storedBackground, textColor: '' }, displayPalette).background;
}
