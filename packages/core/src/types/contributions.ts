import type { Course } from '../domain/course';
import type { CoursePaletteEntry } from '../engine/palette';
import type { LocalizedText } from './context';
import type { DesignTokens, CoursePaint, ShellIconRef } from './slots';

export type {
	DesignTokens,
	CoursePaint,
	CourseBadge,
	CourseBadgeSlotContribution,
	ExportResult,
	ShellIconRef
} from './slots';

export interface BottomTabIconOverride {
	icon?: ShellIconRef;
	iconFill?: ShellIconRef;
}

export interface ThemeShellContribution {
	/** Shell CSS variables merged by host applyActiveTheme */
	customCssVars?: Record<string, string> | ((mode: 'light' | 'dark') => Record<string, string>);
	/** Bottom tab icon overrides when this theme is active (keyed by tab.id) */
	bottomTabIcons?: Record<string, BottomTabIconOverride>;
}

// 1. Theme Contribution
export interface WallpaperThemeAdapter {
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
	readonly customCssVars?:
		| Record<string, string>
		| ((mode: 'light' | 'dark') => Record<string, string>);
	readonly shell?: ThemeShellContribution;
	readonly paletteEntries?:
		| readonly CoursePaletteEntry[]
		| ((mode: 'light' | 'dark') => readonly CoursePaletteEntry[]);
	/** 可选动态取色适配器，宿主 appearance 通过此适配器驱动壁纸/取色，无需 hardcode 'wallpaper' */
	readonly dynamicColorAdapter?: WallpaperThemeAdapter;
	getTokens(mode: 'light' | 'dark', seedColor?: string): DesignTokens;
	/**
	 * Compute course card colors dynamically.
	 * Profile plugins can implement this directly; online-installed plugins should provide static palette arrays.
	 */
	resolveCoursePaint?(course: Course, paletteIndex: number, mode: 'light' | 'dark'): CoursePaint;
}
