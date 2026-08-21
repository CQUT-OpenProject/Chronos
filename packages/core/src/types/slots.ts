import type { Course } from '../domain/course';
import type { CoursePaletteEntry } from '../engine/palette';
import type { Timetable } from '../domain/timetable';
import type { ChronosContext } from './context';
import type { ConfigSchema } from '../schema/schema';

export type LocalizedText = string | (() => string);

// 1. Import tab slot contribution specification (dynamic schema-driven interaction)
export interface ImportTabSlotContribution<
	FormState extends Record<string, unknown> = Record<string, unknown>
> {
	id: string;
	title: LocalizedText;
	order?: number;
	icon?: string;
	supportingText?: LocalizedText;
	/** Declare input fields required by the import source (credentials, captcha, campus select, HTML file, etc.) */
	inputSchema?: ConfigSchema<FormState>;
	defaultInput?: FormState;
	/** Execute import action handler */
	executeImport(inputs: FormState, ctx?: ChronosContext): Promise<Timetable>;
}

// 2. Export action slot contribution specification
export interface ExportResult {
	filename: string;
	mimeType: string;
	content: string | Uint8Array;
}

export interface ExportActionSlotContribution {
	id: string;
	title: LocalizedText;
	order?: number;
	icon?: string;
	export(timetable: Timetable, ctx?: ChronosContext): Promise<ExportResult>;
}

// 3. Mine/Settings section and item slot contribution specification
export interface MineSectionSlotContribution {
	id: string;
	title: LocalizedText;
	order?: number;
}

export interface MineItemSlotContribution {
	id: string;
	sectionId: string;
	title: LocalizedText;
	supporting?: LocalizedText;
	icon?: string;
	iconTone?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
	order?: number;
	href?: string; // Route path pointing to built-in routes or dynamic plugin routes (/plugins/[pluginId])
	onClick?(ctx: ChronosContext): void | Promise<void>;
}

// 4. Plugin fullscreen standalone screen slot contribution specification
export interface PluginScreenSlotContribution {
	id: string; // Unique view ID, mapped to /plugins/[pluginId]/[id]
	title: LocalizedText;
	/** Profile plugins can mount Svelte components; online-installed plugins render via SchemaForm */
	component?: unknown;
	schema?: ConfigSchema<Record<string, unknown>>;
}

// 5. Course card badge and detail action extension
export interface CourseBadge {
	id: string;
	text: string;
	colorScheme?: 'primary' | 'secondary' | 'error' | 'warning' | 'tertiary';
}

export interface CourseBadgeSlotContribution {
	id: string;
	getBadge(course: Course, ctx: ChronosContext): CourseBadge | CourseBadge[] | null;
}

export interface CourseActionSlotContribution {
	id: string;
	label: LocalizedText;
	icon?: string;
	order?: number;
	onExecute(course: Course, ctx: ChronosContext): void | Promise<void>;
}

// 6. Theme slot contribution specification
export interface DesignTokens {
	surface: string;
	onSurface: string;
	primary: string;
	onPrimary: string;
	surfaceVariant: string;
	outline: string;
	[customToken: string]: string;
}

export interface CoursePaint {
	background: string;
	foreground: string;
}

export interface ThemeSlotContribution {
	id: string;
	name: LocalizedText;
	description?: LocalizedText;
	disabled?: boolean | (() => boolean);
	supportsDynamicColor?: boolean;
	className?: string;
	customCssVars?: Record<string, string> | ((mode: 'light' | 'dark') => Record<string, string>);
	paletteEntries?:
		| readonly CoursePaletteEntry[]
		| ((mode: 'light' | 'dark') => readonly CoursePaletteEntry[]);
	getTokens(mode: 'light' | 'dark', seedColor?: string): DesignTokens;
	resolveCoursePaint?(course: Course, paletteIndex: number, mode: 'light' | 'dark'): CoursePaint;
}

// 7. Shell bottom bar navigation tab slot contribution specification
export interface BottomTabSlotContribution {
	id: string;
	label: LocalizedText;
	href: string;
	order?: number;
	icon?: unknown;
	iconFill?: unknown;
	badge?: LocalizedText | (() => number | string | null);
	onClick?(event: MouseEvent, ctx?: ChronosContext): void | Promise<void>;
}

/** Standard slot contract map */
export interface StandardSlotMap {
	'import.source.tab': ImportTabSlotContribution<Record<string, unknown>>;
	'export.action': ExportActionSlotContribution;
	'mine.section': MineSectionSlotContribution;
	'mine.item': MineItemSlotContribution;
	'shell.route.screen': PluginScreenSlotContribution;
	'shell.bottom-bar.tab': BottomTabSlotContribution;
	'timetable.cell.badge': CourseBadgeSlotContribution;
	'course.detail.action': CourseActionSlotContribution;
	'theme.definition': ThemeSlotContribution;
	[customSlotName: string]: unknown;
}

/**
 * Custom slot map extension point for module augmentation.
 * Plugins can extend this interface via `declare module '@chronos/core'`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CustomSlotMap {}

/** Complete slot contract map combining standard and custom slots */
export type ChronosSlotMap = StandardSlotMap & CustomSlotMap;
