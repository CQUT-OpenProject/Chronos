import type { CoursePaletteEntry } from '../engine/palette';
import type { ThemeContribution, ThemeWorkbenchColors } from '../types/contributions';
import { validateWorkbenchColors } from './workbench-colors';

export type ColorThemeJsonCoursePalette = Record<'light' | 'dark', readonly CoursePaletteEntry[]>;

export interface ColorThemeJson {
	id: string;
	name: Record<string, string> | string;
	description?: Record<string, string> | string;
	className?: string;
	recommendedIconTheme?: string;
	disabled?: boolean;
	coursePalette?: ColorThemeJsonCoursePalette;
	variants: {
		light: { colors: Record<string, string> };
		dark: { colors: Record<string, string> };
	};
}

export function parseColorThemeJson(raw: unknown): ColorThemeJson {
	if (!raw || typeof raw !== 'object') {
		throw new Error('Invalid color theme JSON: root must be an object');
	}
	const data = raw as Record<string, unknown>;
	if (typeof data.id !== 'string' || !data.id) {
		throw new Error('Invalid color theme JSON: missing id');
	}
	if (!data.variants || typeof data.variants !== 'object') {
		throw new Error('Invalid color theme JSON: missing variants');
	}
	const variants = data.variants as Record<string, unknown>;
	if (!variants.light || !variants.dark) {
		throw new Error('Invalid color theme JSON: variants must include light and dark');
	}
	return data as unknown as ColorThemeJson;
}

export function validateThemeWorkbenchColors(
	workbenchColors: ThemeWorkbenchColors,
	themeId: string
): ThemeWorkbenchColors {
	const light = validateWorkbenchColors(workbenchColors.light, { label: `${themeId} light` });
	const dark = validateWorkbenchColors(workbenchColors.dark, { label: `${themeId} dark` });

	for (const w of light.warnings) console.warn(w);
	for (const w of dark.warnings) console.warn(w);

	const errors = [...light.errors, ...dark.errors];
	if (errors.length > 0) {
		throw new Error(`Invalid workbench colors for theme "${themeId}": ${errors.join('; ')}`);
	}

	return { light: light.colors, dark: dark.colors };
}

export function resolveThemeWorkbenchColors(
	theme: ThemeContribution,
	mode: 'light' | 'dark'
): Record<string, string> {
	return theme.workbenchColors[mode];
}

export function createThemeFromColorJson(json: ColorThemeJson): ThemeContribution {
	const workbenchColors = validateThemeWorkbenchColors(
		{
			light: json.variants.light.colors ?? {},
			dark: json.variants.dark.colors ?? {}
		},
		json.id
	);

	const paletteEntries = json.coursePalette
		? (mode: 'light' | 'dark') => json.coursePalette![mode]
		: undefined;

	return {
		id: json.id,
		name: json.name,
		description: json.description,
		disabled: json.disabled,
		className: json.className,
		recommendedIconTheme: json.recommendedIconTheme,
		workbenchColors,
		paletteEntries
	};
}
