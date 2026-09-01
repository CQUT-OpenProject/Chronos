import type { Course } from '../domain/course';
import type { Timetable } from '../domain/timetable';
import type { ChronosContext } from './context';
import type { ConfigSchema } from '../schema/schema';
import type { ThemeContribution } from './contributions';

export type ImportSlotErrorKind =
	| 'no-data'
	| 'invalid-data'
	| 'network'
	| 'unsupported'
	| 'unknown';

export class ImportSlotError extends Error {
	readonly kind: ImportSlotErrorKind;

	constructor(kind: ImportSlotErrorKind, message: string) {
		super(message);
		this.name = 'ImportSlotError';
		this.kind = kind;
	}
}

import { resolveLocaleMapText } from '../i18n/i18n-catalog';

export type LocalizedText = string | Record<string, string> | (() => string);

/** Host registry key or structured shell icon descriptor. */
export type ShellIconRef = string | import('../theme/icon-theme').ShellIconDescriptor;

/** How the host groups import sources for copy and onboarding. */
export type ImportKind = 'online' | 'file' | 'link' | 'custom';

// 1. Import tab slot contribution specification (dynamic schema-driven interaction)
export interface ImportTabSlotContribution<FormState extends object = Record<string, unknown>> {
	id: string;
	title: LocalizedText;
	order?: number;
	icon?: ShellIconRef;
	supportingText?: LocalizedText;
	/** Host-facing capability tag for onboarding copy and import descriptions. */
	importKind?: ImportKind;
	badge?: LocalizedText;
	/** Declare input fields required by the import source (credentials, captcha, campus select, HTML file, etc.) */
	inputSchema?: ConfigSchema<FormState>;
	defaultInput?: FormState;
	/** Optional rich-UI component mounted via the single CHRONOS_MOUNTABLE protocol */
	component?: import('./mountable').ChronosMountable;
	/** Optional confirm-phase rich UI (mounted on the import confirm screen) */
	confirmComponent?: import('./mountable').ChronosMountable;
	/** Confirm-phase SchemaForm fallback when confirmComponent is absent */
	confirmSchema?: ConfigSchema<FormState>;
	/** Initial values for confirm-phase inputs */
	confirmDefaultInput?: FormState;
	/** Return an error message when confirm inputs are invalid; null when ready to import */
	validateConfirmInputs?(inputs: FormState): string | null;
	/** Merge confirm-phase inputs into preview before ingest */
	finalizePreview?(
		preview: Timetable,
		confirmInputs: FormState,
		ctx?: ChronosContext
	): Timetable | Promise<Timetable>;
	/**
	 * Deep-link handshake: lets a host deep-link entry (e.g. a /s landing page)
	 * dispatch generically without knowing any concrete slot id or input shape.
	 */
	deepLink?: {
		/** Build executeImport inputs from the location; return null if it is not ours. */
		fromLocation(location: Pick<Location, 'hash' | 'search'>): Record<string, unknown> | null;
	};
	/** Execute import action handler */
	executeImport(inputs: FormState, ctx?: ChronosContext): Promise<Timetable>;
}

// 2. Export action slot contribution specification
export type ExportDisposition = 'clipboard' | 'download' | 'custom';

export interface ExportResult {
	filename?: string;
	mimeType: string;
	content: string | Uint8Array;
	disposition?: ExportDisposition;
	successMessage?: LocalizedText;
}

export interface ExportActionSlotContribution {
	id: string;
	title: LocalizedText;
	order?: number;
	icon?: ShellIconRef;
	description?: LocalizedText;
	disposition?: ExportDisposition;
	isPrimary?: boolean;
	export(timetable: Timetable, ctx?: ChronosContext): Promise<ExportResult>;
	estimateLength?(timetable: Timetable, ctx?: ChronosContext): Promise<number>;
	checkWarning?(timetable: Timetable, ctx?: ChronosContext): Promise<string | null>;
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
	icon?: ShellIconRef;
	iconTone?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
	keywords?: string[];
	order?: number;
	href?: string; // Route path pointing to built-in routes or dynamic plugin routes (/plugins/[pluginId])
	onClick?(ctx: ChronosContext): void | Promise<void>;
}

// 4. Plugin fullscreen standalone screen slot contribution specification
export interface PluginScreenSlotContribution {
	id: string; // Unique view ID, mapped to /plugins/[pluginId]/[id]
	title: LocalizedText;
	/** Svelte component for rich UI via the single CHRONOS_MOUNTABLE protocol; falls back to schema if absent */
	component?: import('./mountable').ChronosMountable;
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
export interface CoursePaint {
	background: string;
	foreground: string;
}

// 7. Shell bottom bar navigation tab slot contribution specification
/** Host-owned mine section used when a `mine.item` omits `sectionId`. */
export const DEFAULT_MINE_SECTION_ID = 'app-support';

export type HostShellPanel = 'timetable' | 'mine';

export interface BottomTabSlotContribution {
	id: string;
	label: LocalizedText;
	order?: number;
	/** Host icon registry key or Svelte component */
	icon?: ShellIconRef;
	/** Filled variant for active state */
	iconFill?: ShellIconRef;
	badge?: LocalizedText | (() => number | string | null);
	onClick?(event: MouseEvent, ctx?: ChronosContext): void | Promise<void>;
	/** Declares this tab as the cold-start landing page when the app opens on `/`. */
	defaultLaunch?: boolean;
	/** Host-owned panel; plugin tabs omit this and render via `shell.route.screen`. */
	hostPanel?: HostShellPanel;
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
	'theme.definition': ThemeContribution;
	'theme.icon.definition': import('../theme/icon-theme').IconThemeContribution;
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

/**
 * Resolves a LocalizedText to a plain string. Single implementation for the
 * `typeof text === 'function' ? text() : text` pattern previously duplicated
 * across every slot consumer.
 */
export function resolveLocalizedText(
	text: LocalizedText | undefined | null,
	fallback = '',
	locale = 'zh-cn'
): string {
	if (text === undefined || text === null) return fallback;
	if (typeof text === 'function') return text() ?? fallback;
	if (typeof text === 'string') return text;
	return resolveLocaleMapText(text, locale, fallback);
}

/**
 * Picks the primary action from an order-sorted contribution list:
 * the explicit `isPrimary` item if any, otherwise the first item.
 */
export function pickPrimary<T extends { isPrimary?: boolean }>(items: readonly T[]): T | undefined {
	return items.find((item) => item.isPrimary) ?? items[0];
}

/**
 * Resolves the default cold-start tab from bottom-bar contributions.
 * When multiple tabs declare defaultLaunch, the lowest order wins.
 */
export function resolveDefaultLaunchTab(
	tabs: readonly BottomTabSlotContribution[]
): BottomTabSlotContribution | undefined {
	return tabs.find((tab) => tab.defaultLaunch);
}

export function resolveHostPanelTab(
	tabs: readonly BottomTabSlotContribution[],
	panel: HostShellPanel
): BottomTabSlotContribution | undefined {
	return tabs.find((tab) => tab.hostPanel === panel);
}
