/** Closed workbench color keys (VS Code–style semantic ids). */
export const WORKBENCH_COLOR_KEYS = [
	'color.surface',
	'color.onSurface',
	'color.primary',
	'color.onPrimary',
	'color.surfaceVariant',
	'color.outline',
	'color.secondary',
	'color.onSecondary',
	'color.primaryContainer',
	'color.onPrimaryContainer',
	'color.secondaryContainer',
	'color.onSecondaryContainer',
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
	'color.onSurface': { cssVar: '--color-onSurface' },
	'color.primary': { cssVar: '--color-primary' },
	'color.onPrimary': { cssVar: '--color-onPrimary' },
	'color.surfaceVariant': { cssVar: '--color-surfaceVariant' },
	'color.outline': { cssVar: '--color-outline' },
	'color.secondary': { cssVar: '--color-secondary' },
	'color.onSecondary': { cssVar: '--color-onSecondary' },
	'color.primaryContainer': { cssVar: '--color-primaryContainer' },
	'color.onPrimaryContainer': { cssVar: '--color-onPrimaryContainer' },
	'color.secondaryContainer': { cssVar: '--color-secondaryContainer' },
	'color.onSecondaryContainer': { cssVar: '--color-onSecondaryContainer' },
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

const REGISTRY_KEY_SET = new Set<string>(WORKBENCH_COLOR_KEYS);

export function isWorkbenchColorKey(key: string): key is WorkbenchColorKey {
	return REGISTRY_KEY_SET.has(key);
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

	for (const [key, value] of Object.entries(input)) {
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

export function workbenchColorsToDesignTokens(
	colors: Record<string, string>
): Record<string, string> {
	const tokens: Record<string, string> = {};
	for (const [key, value] of Object.entries(colors)) {
		if (key.startsWith('color.')) {
			tokens[key.slice('color.'.length)] = value;
		}
	}
	return tokens;
}

export function designTokensToWorkbenchColors(
	tokens: Record<string, string>
): Record<string, string> {
	const colors: Record<string, string> = {};
	for (const [key, value] of Object.entries(tokens)) {
		if (typeof value === 'string' && value.length > 0) {
			colors[`color.${key}`] = value;
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
