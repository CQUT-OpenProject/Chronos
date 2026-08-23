import type { Course } from '../domain/course';
import type { CoursePaletteEntry } from '../engine/palette';
import type { DesignTokens, CoursePaint, LocalizedText } from './slots';

export type {
	DesignTokens,
	CoursePaint,
	CourseBadge,
	CourseBadgeSlotContribution,
	ExportResult,
	ShellIconRef
} from './slots';

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
	getTokens(mode: 'light' | 'dark', seedColor?: string): DesignTokens;
	resolveCoursePaint?(course: Course, paletteIndex: number, mode: 'light' | 'dark'): CoursePaint;
}
