import type { Course } from '../domain/course';
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
	getTokens(mode: 'light' | 'dark', seedColor?: string): DesignTokens;
	/**
	 * Compute course card colors dynamically.
	 * In-process plugins can implement this directly; Worker sandbox plugins should provide static palette arrays.
	 */
	resolveCoursePaint?(course: Course, paletteIndex: number, mode: 'light' | 'dark'): CoursePaint;
}

// 2. Course Badge Contribution
export interface CourseBadgeContribution {
	readonly id: string;
	/** Synchronously generate badge (in-process plugins) */
	getBadge?(course: Course): CourseBadge | CourseBadge[] | null;
	/** Asynchronously project badges for batch processing (sandbox plugins) */
	projectBadges?(courses: Course[]): Promise<Record<string, CourseBadge[]>>;
}
