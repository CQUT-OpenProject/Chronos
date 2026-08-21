import type { Course } from '../domain/course';
import type { CoursePaletteEntry } from '../engine/palette';
import type { LocalizedText } from './context';
import type { DesignTokens, CoursePaint } from './slots';

export type {
	DesignTokens,
	CoursePaint,
	CourseBadge,
	CourseBadgeSlotContribution,
	ExportResult
} from './slots';

// 1. Theme Contribution
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
	readonly paletteEntries?:
		| readonly CoursePaletteEntry[]
		| ((mode: 'light' | 'dark') => readonly CoursePaletteEntry[]);
	getTokens(mode: 'light' | 'dark', seedColor?: string): DesignTokens;
	/**
	 * Compute course card colors dynamically.
	 * Profile plugins can implement this directly; online-installed plugins should provide static palette arrays.
	 */
	resolveCoursePaint?(course: Course, paletteIndex: number, mode: 'light' | 'dark'): CoursePaint;
}
