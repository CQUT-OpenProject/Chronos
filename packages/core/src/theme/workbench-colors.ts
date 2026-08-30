/** Closed workbench color keys (VS Code–style semantic ids). */
export const WORKBENCH_COLOR_KEYS = [
	'color.surface',
	'color.on-surface',
	'color.primary',
	'color.on-primary',
	'color.surface-variant',
	'color.outline',
	'color.secondary',
	'color.primary-dim',
	'color.primary-container',
	'color.on-primary-container',
	'color.inverse-primary',
	'color.secondary-dim',
	'color.on-secondary',
	'color.secondary-container',
	'color.on-secondary-container',
	'color.primary-container-subtle',
	'color.on-primary-container-subtle',
	'color.secondary-container-subtle',
	'color.on-secondary-container-subtle',
	'color.outline-variant',
	'color.surface-container-high',
	'color.canvas',
	'color.ink',
	'color.border-subtle',
	'color.success',
	'color.warning',
	'color.danger',
	'shell.bottomTab.activeBackground',
	'shell.bottomTab.activeForeground',
	'shell.bottomBar.background',
	'shell.topBar.background',
	'leadingIcon.background',
	'leadingIcon.color',
	'leadingIcon.backgroundPrimary',
	'leadingIcon.colorPrimary',
	'leadingIcon.backgroundSecondary',
	'leadingIcon.colorSecondary',
	'leadingIcon.backgroundTertiary',
	'leadingIcon.colorTertiary',
	'leadingIcon.backgroundNeutral',
	'leadingIcon.colorNeutral',
	'timetable.period.activeBackground',
	'timetable.period.activeBackgroundImage'
] as const;

export type WorkbenchColorKey = (typeof WORKBENCH_COLOR_KEYS)[number];

export interface WorkbenchColorDefinition {
	cssVar: string;
	description?: string;
	deprecated?: boolean;
}

export const WORKBENCH_COLOR_REGISTRY: Record<WorkbenchColorKey, WorkbenchColorDefinition> = {
	'color.surface': { cssVar: '--color-surface' },
	'color.on-surface': { cssVar: '--color-on-surface' },
	'color.primary': { cssVar: '--color-primary' },
	'color.on-primary': { cssVar: '--color-on-primary' },
	'color.surface-variant': { cssVar: '--color-surface-variant' },
	'color.outline': { cssVar: '--color-outline' },
	'color.secondary': { cssVar: '--color-secondary' },
	'color.primary-dim': { cssVar: '--color-primary-dim' },
	'color.primary-container': { cssVar: '--color-primary-container' },
	'color.on-primary-container': { cssVar: '--color-on-primary-container' },
	'color.inverse-primary': { cssVar: '--color-inverse-primary' },
	'color.secondary-dim': { cssVar: '--color-secondary-dim' },
	'color.on-secondary': { cssVar: '--color-on-secondary' },
	'color.secondary-container': { cssVar: '--color-secondary-container' },
	'color.on-secondary-container': { cssVar: '--color-on-secondary-container' },
	'color.primary-container-subtle': { cssVar: '--color-primary-container-subtle' },
	'color.on-primary-container-subtle': { cssVar: '--color-on-primary-container-subtle' },
	'color.secondary-container-subtle': { cssVar: '--color-secondary-container-subtle' },
	'color.on-secondary-container-subtle': { cssVar: '--color-on-secondary-container-subtle' },
	'color.outline-variant': { cssVar: '--color-outline-variant' },
	'color.surface-container-high': { cssVar: '--color-surface-container-high' },
	'color.canvas': { cssVar: '--color-canvas' },
	'color.ink': { cssVar: '--color-ink' },
	'color.border-subtle': { cssVar: '--color-border-subtle' },
	'color.success': { cssVar: '--color-success' },
	'color.warning': { cssVar: '--color-warning' },
	'color.danger': { cssVar: '--color-danger' },
	'shell.bottomTab.activeBackground': { cssVar: '--shell-bottom-tab-active-bg' },
	'shell.bottomTab.activeForeground': { cssVar: '--shell-bottom-tab-active-fg' },
	'shell.bottomBar.background': { cssVar: '--shell-bottom-bar-bg' },
	'shell.topBar.background': { cssVar: '--shell-top-bar-bg' },
	'leadingIcon.background': { cssVar: '--leading-icon-bg' },
	'leadingIcon.color': { cssVar: '--leading-icon-color' },
	'leadingIcon.backgroundPrimary': { cssVar: '--leading-icon-bg-primary' },
	'leadingIcon.colorPrimary': { cssVar: '--leading-icon-color-primary' },
	'leadingIcon.backgroundSecondary': { cssVar: '--leading-icon-bg-secondary' },
	'leadingIcon.colorSecondary': { cssVar: '--leading-icon-color-secondary' },
	'leadingIcon.backgroundTertiary': { cssVar: '--leading-icon-bg-tertiary' },
	'leadingIcon.colorTertiary': { cssVar: '--leading-icon-color-tertiary' },
	'leadingIcon.backgroundNeutral': { cssVar: '--leading-icon-bg-neutral' },
	'leadingIcon.colorNeutral': { cssVar: '--leading-icon-color-neutral' },
	'timetable.period.activeBackground': { cssVar: '--period-active-bg' },
	'timetable.period.activeBackgroundImage': { cssVar: '--period-active-bg-image' }
};

/** Legacy camelCase registry keys accepted at read time and mapped to hyphenated keys. */
const LEGACY_WORKBENCH_COLOR_ALIASES: Record<string, WorkbenchColorKey> = {
	'color.onSurface': 'color.on-surface',
	'color.onPrimary': 'color.on-primary',
	'color.surfaceVariant': 'color.surface-variant',
	'color.onSecondary': 'color.on-secondary',
	'color.primaryContainer': 'color.primary-container',
	'color.onPrimaryContainer': 'color.on-primary-container',
	'color.secondaryContainer': 'color.secondary-container',
	'color.onSecondaryContainer': 'color.on-secondary-container'
};

const REGISTRY_KEY_SET = new Set<string>(WORKBENCH_COLOR_KEYS);

export function isWorkbenchColorKey(key: string): key is WorkbenchColorKey {
	return REGISTRY_KEY_SET.has(key);
}

export function normalizeWorkbenchColorKey(key: string): {
	key: string;
	legacy: boolean;
} {
	const normalized = LEGACY_WORKBENCH_COLOR_ALIASES[key] ?? key;
	return { key: normalized, legacy: normalized !== key };
}

export function normalizeWorkbenchColorKeys(input: Record<string, string>): {
	colors: Record<string, string>;
	warnings: string[];
} {
	const colors: Record<string, string> = {};
	const warnings: string[] = [];
	const seen = new Map<string, string>();

	for (const [rawKey, value] of Object.entries(input)) {
		const { key, legacy } = normalizeWorkbenchColorKey(rawKey);
		if (legacy) {
			warnings.push(`legacy key "${rawKey}" normalized to "${key}"`);
		}
		const previous = seen.get(key);
		if (previous !== undefined && previous !== rawKey) {
			warnings.push(`duplicate workbench color key "${key}" (last value wins)`);
		}
		seen.set(key, rawKey);
		colors[key] = value;
	}

	return { colors, warnings };
}

export interface WorkbenchColorValidationResult {
	colors: Record<string, string>;
	warnings: string[];
	errors: string[];
}

function isValidCssColorValue(value: string): boolean {
	const trimmed = value.trim();
	if (!trimmed) return false;
	if (trimmed.includes('<') || trimmed.toLowerCase().includes('javascript:')) return false;
	return true;
}

export function validateWorkbenchColors(
	input: Record<string, string> | undefined,
	options?: { label?: string }
): WorkbenchColorValidationResult {
	const colors: Record<string, string> = {};
	const warnings: string[] = [];
	const errors: string[] = [];
	const label = options?.label ?? 'workbench colors';

	if (!input) return { colors, warnings, errors };

	const normalized = normalizeWorkbenchColorKeys(input);
	warnings.push(...normalized.warnings);

	for (const [key, value] of Object.entries(normalized.colors)) {
		if (typeof value !== 'string') {
			errors.push(`${label}: invalid value for "${key}"`);
			continue;
		}
		if (!isValidCssColorValue(value)) {
			errors.push(`${label}: rejected unsafe or empty value for "${key}"`);
			continue;
		}
		if (!isWorkbenchColorKey(key)) {
			warnings.push(`${label}: unknown key "${key}" (ignored, like VS Code color themes)`);
			continue;
		}
		colors[key] = value.trim();
	}

	return { colors, warnings, errors };
}

export function applyWorkbenchColors(
	target: HTMLElement,
	colors: Record<string, string>
): string[] {
	const appliedKeys: string[] = [];
	for (const [key, value] of Object.entries(colors)) {
		if (!isWorkbenchColorKey(key)) continue;
		const def = WORKBENCH_COLOR_REGISTRY[key];
		target.style.setProperty(def.cssVar, value);
		appliedKeys.push(def.cssVar);
	}
	return appliedKeys;
}

function tokenKeyToWorkbenchColorKey(tokenKey: string): string {
	const kebab = tokenKey.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	return `color.${kebab}`;
}

export function designTokensToWorkbenchColors(
	tokens: Record<string, string>
): Record<string, string> {
	const colors: Record<string, string> = {};
	for (const [key, value] of Object.entries(tokens)) {
		if (typeof value === 'string' && value.length > 0) {
			colors[tokenKeyToWorkbenchColorKey(key)] = value;
		}
	}
	return colors;
}

export function createWorkbenchColorsFromTokens(
	light: Record<string, string>,
	dark: Record<string, string>
): { light: Record<string, string>; dark: Record<string, string> } {
	return {
		light: designTokensToWorkbenchColors(light),
		dark: designTokensToWorkbenchColors(dark)
	};
}
