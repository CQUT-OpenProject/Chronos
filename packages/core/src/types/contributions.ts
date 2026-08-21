import type { Course } from '../domain/course';
import type { CoursePaletteEntry } from '../engine/palette';
import type { LocalizedText } from './context';
import type { DesignTokens, CoursePaint, CourseBadge } from './slots';

export type { DesignTokens, CoursePaint, CourseBadge, ExportResult } from './slots';

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

// 2. Course Badge Contribution
export interface CourseBadgeContribution {
	readonly id: string;
	/** Synchronously generate badge (in-process plugins) */
	getBadge?(course: Course): CourseBadge | CourseBadge[] | null;
	/** Asynchronously project badges for batch processing (online-installed plugins) */
	projectBadges?(courses: Course[]): Promise<Record<string, CourseBadge[]>>;
}
