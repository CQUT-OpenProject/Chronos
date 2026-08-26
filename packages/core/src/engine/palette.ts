export type CoursePaletteEntry = { background: string; foreground: string };

const COURSE_PALETTE: [string, string][] = [
	['#EADDFF', '#21005D'],
	['#FFDBC9', '#311100'],
	['#C4EED0', '#072711'],
	['#D3E3FD', '#041E49'],
	['#FFD8E4', '#31111D'],
	['#F6E1B0', '#241A00'],
	['#A9F0E4', '#00201C'],
	['#DCE9A1', '#181E00']
];

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

const PALETTE_SLOT_MAP = new Map<string, number>(
	COURSE_PALETTE_ENTRIES.map((entry, index) => [entry.background.toLowerCase(), index])
);

export function defaultPaletteSlot(hex: string): number | null {
	return PALETTE_SLOT_MAP.get(hex.trim().toLowerCase()) ?? null;
}

export function persistSwatchSelection(displayIndex: number): CoursePaletteEntry {
	return COURSE_PALETTE_ENTRIES[displayIndex] ?? COURSE_PALETTE_ENTRIES[0]!;
}

export function resolveCoursePaint(
	stored: { name?: string; color?: string; textColor?: string },
	displayPalette: readonly CoursePaletteEntry[] = COURSE_PALETTE_ENTRIES
): { background: string; foreground: string } {
	const name = stored.name ? normalizedCourseName(stored.name) : '';
	const color = stored.color || (name ? coursePalette(name)[0] : '');
	const slot = defaultPaletteSlot(color);
	if (slot == null || displayPalette.length === 0) {
		if (name) {
			const [bg, fg] = coursePalette(name);
			return { background: stored.color || bg, foreground: stored.textColor || fg };
		}
		return { background: stored.color || '#EADDFF', foreground: stored.textColor || '#21005D' };
	}
	return displayPalette[slot % displayPalette.length]!;
}

export function resolveCoursePalette(
	mode: string,
	dynamicPalette: readonly CoursePaletteEntry[] | null
): readonly CoursePaletteEntry[] {
	const normalized = (mode || '').toLowerCase();
	if (normalized !== 'vibrant' && dynamicPalette && dynamicPalette.length > 0) {
		return dynamicPalette;
	}
	return COURSE_PALETTE_ENTRIES;
}

interface CourseSlotPreference {
	name: string;
	slot: number;
	hash: number;
}

/** Spread automatic (default-slot) courses across the display palette. */
export function assignCourseDisplayColors(
	courses: { name: string; color?: string }[],
	palette: readonly CoursePaletteEntry[] = COURSE_PALETTE_ENTRIES
): Map<string, CoursePaletteEntry> {
	if (palette.length === 0) return new Map();

	const preferredMap = new Map<string, CourseSlotPreference>();
	for (const course of courses) {
		const name = normalizedCourseName(course.name);
		const color = course.color || coursePalette(name)[0];
		const slot = defaultPaletteSlot(color);
		if (slot == null) continue;
		if (!preferredMap.has(name)) {
			preferredMap.set(name, {
				name,
				slot,
				hash: kotlinStringHashCode(name)
			});
		}
	}

	const sortedPreferences = [...preferredMap.values()].sort(
		(left, right) => left.hash - right.hash || left.name.localeCompare(right.name)
	);

	const assigned = new Map<string, CoursePaletteEntry>();
	const occupied = new Set<number>();
	const deferred: string[] = [];

	for (const { name, slot } of sortedPreferences) {
		const targetSlot = slot % palette.length;
		if (occupied.has(targetSlot)) {
			deferred.push(name);
			continue;
		}
		occupied.add(targetSlot);
		assigned.set(name, palette[targetSlot]!);
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
