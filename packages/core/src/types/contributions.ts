import type { CoursePaletteEntry } from '../engine/palette';
import type { LocalizedText } from './slots';

export type { CoursePaint, CourseBadgeSlotContribution } from './slots';

export interface ThemeWorkbenchColors {
	light: Record<string, string>;
	dark: Record<string, string>;
}

export interface DynamicColorAdapter {
	extractWallpaperSeed(
		uri: string
	): Promise<{ seed: number; coursePalette: readonly CoursePaletteEntry[] }>;
	paintWallpaperTheme(seed: number, isDark: boolean, target: HTMLElement): void;
	clearWallpaperTheme(target?: HTMLElement): void;
}

export interface ThemeContribution {
	readonly id: string;
	readonly name: LocalizedText;
	readonly description?: LocalizedText;
	readonly disabled?: boolean | (() => boolean);
	readonly supportsDynamicColor?: boolean;
	readonly className?: string;
	readonly workbenchColors: ThemeWorkbenchColors;
	readonly recommendedIconTheme?: string;
	readonly paletteEntries?:
		| readonly CoursePaletteEntry[]
		| ((mode: 'light' | 'dark') => readonly CoursePaletteEntry[]);
	readonly dynamicColorAdapter?: DynamicColorAdapter;
}
