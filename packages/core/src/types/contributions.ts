import type { Course } from '../domain/course';
import type { Timetable } from '../domain/timetable';
import type { ChronosContext, LocalizedText } from './context';
import type { DesignTokens, CoursePaint, CourseBadge, ExportResult } from './slots';

export type { DesignTokens, CoursePaint, CourseBadge, ExportResult } from './slots';

// 1. Theme Contribution
export interface ThemeContribution {
	readonly id: string;
	readonly name: LocalizedText;
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

// 3. Course Action Contribution
export interface CourseActionContribution {
	readonly id: string;
	readonly label: LocalizedText;
	readonly icon?: string;
	onExecute(course: Course, ctx: ChronosContext): void | Promise<void>;
}

// 4. Timetable Source Adapter
export interface TimetableSourceAdapter {
	readonly id: string;
	readonly title: LocalizedText;
	readonly authType: 'none' | 'password' | 'file';
	fetchSchedule(params: {
		username?: string;
		password?: string;
		fileContent?: string;
	}): Promise<Timetable>;
}

// 5. Timetable Exporter Adapter
export interface TimetableExporterAdapter {
	readonly id: string;
	readonly title: LocalizedText;
	export(timetable: Timetable): Promise<ExportResult>;
}
