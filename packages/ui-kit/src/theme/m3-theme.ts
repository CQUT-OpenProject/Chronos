import {
	ContrastCurve,
	DynamicColor,
	DynamicScheme,
	Hct,
	MaterialDynamicColors,
	TonalPalette,
	Variant
} from '@ktibow/material-color-utilities-nightly';
import type {
	Course,
	CoursePaint,
	DesignTokens,
	ThemeContribution,
	CoursePaletteEntry
} from '@chronos/core';
import { createWorkbenchColorsFromTokens } from '@chronos/core/theme/workbench-colors';

export const BRAND_SOURCE_ARGB = 0xff0068b7;

/** Host semantic color defaults — single source for generated CSS and m3-default tokens. */
export const CHRONOS_HOST_COLOR_KEYS = [
	'canvas',
	'ink',
	'border-subtle',
	'surface',
	'surface-container',
	'surface-container-high',
	'outline',
	'outline-variant',
	'success',
	'warning',
	'danger'
] as const;

export type ChronosHostColorKey = (typeof CHRONOS_HOST_COLOR_KEYS)[number];

export const CHRONOS_HOST_COLORS: Record<'light' | 'dark', Record<ChronosHostColorKey, string>> = {
	light: {
		canvas: '#f0f4f8',
		ink: '#0b1f33',
		'border-subtle': '#d4e0eb',
		surface: '#ffffff',
		'surface-container': '#ffffff',
		'surface-container-high': '#f1f5f9',
		outline: '#cbd5e1',
		'outline-variant': '#e2e8f0',
		success: '#15803d',
		warning: '#b45309',
		danger: '#e60012'
	},
	dark: {
		canvas: '#121316',
		ink: '#f8fafc',
		'border-subtle': '#2e3038',
		surface: '#1e2026',
		'surface-container': '#1e2026',
		'surface-container-high': '#24262e',
		outline: '#334155',
		'outline-variant': '#2e3038',
		success: '#4ade80',
		warning: '#fbbf24',
		danger: '#e60012'
	}
};

/** Tailwind @theme inline bridge keys for host semantics. */
export const CHRONOS_HOST_INLINE_THEME_KEYS = [
	'canvas',
	'ink',
	'success',
	'warning',
	'danger',
	'border-subtle'
] as const;

const materialColors = new MaterialDynamicColors();

const onOnPrimary = DynamicColor.fromPalette({
	name: 'on_on_primary',
	palette: (s) => s.primaryPalette,
	background: () => materialColors.onPrimary(),
	contrastCurve: () => new ContrastCurve(6, 6, 7, 11)
});

const primaryContainerSubtle = DynamicColor.fromPalette({
	name: 'primary_container_subtle',
	palette: (s) => s.primaryPalette,
	isBackground: true,
	background: (s) => materialColors.highestSurface(s),
	contrastCurve: () => undefined
});

const onPrimaryContainerSubtle = DynamicColor.fromPalette({
	name: 'on_primary_container_subtle',
	palette: (s) => s.primaryPalette,
	background: () => primaryContainerSubtle,
	contrastCurve: () => new ContrastCurve(6, 6, 7, 11)
});

const secondaryContainerSubtle = DynamicColor.fromPalette({
	name: 'secondary_container_subtle',
	palette: (s) => s.secondaryPalette,
	isBackground: true,
	background: (s) => materialColors.highestSurface(s),
	contrastCurve: () => undefined
});

const onSecondaryContainerSubtle = DynamicColor.fromPalette({
	name: 'on_secondary_container_subtle',
	palette: (s) => s.secondaryPalette,
	background: () => secondaryContainerSubtle,
	contrastCurve: () => new ContrastCurve(6, 6, 7, 11)
});

const tertiaryContainerSubtle = DynamicColor.fromPalette({
	name: 'tertiary_container_subtle',
	palette: (s) => s.tertiaryPalette,
	isBackground: true,
	background: (s) => materialColors.highestSurface(s),
	contrastCurve: () => undefined
});

const onTertiaryContainerSubtle = DynamicColor.fromPalette({
	name: 'on_tertiary_container_subtle',
	palette: (s) => s.tertiaryPalette,
	background: () => tertiaryContainerSubtle,
	contrastCurve: () => new ContrastCurve(6, 6, 7, 11)
});

const errorContainerSubtle = DynamicColor.fromPalette({
	name: 'error_container_subtle',
	palette: (s) => s.errorPalette,
	isBackground: true,
	background: (s) => materialColors.highestSurface(s),
	contrastCurve: () => undefined
});

const onErrorContainerSubtle = DynamicColor.fromPalette({
	name: 'on_error_container_subtle',
	palette: (s) => s.errorPalette,
	background: () => errorContainerSubtle,
	contrastCurve: () => new ContrastCurve(6, 6, 7, 11)
});

const allDynamicColors = [
	...materialColors.allColors.filter((c) => c.name !== 'background' && c.name !== 'on_background'),
	materialColors.shadow(),
	materialColors.scrim(),
	onOnPrimary,
	primaryContainerSubtle,
	onPrimaryContainerSubtle,
	secondaryContainerSubtle,
	onSecondaryContainerSubtle,
	tertiaryContainerSubtle,
	onTertiaryContainerSubtle,
	errorContainerSubtle,
	onErrorContainerSubtle
];

const CHRONOS_COLOR_ALIASES = [
	{ name: 'brand', source: 'primary' },
	{ name: 'brand-muted', source: 'primary-container-subtle' },
	{ name: 'soft-blue', source: 'inverse-primary' },
	{ name: 'surface-variant', source: 'surface-container-low' }
] as const;

const ACCENT_ALIASES = CHRONOS_COLOR_ALIASES.filter((alias) => alias.name !== 'surface-variant');

function isAccentToken(kebabName: string) {
	return /primary|secondary|tertiary/.test(kebabName);
}

function argbToHex(argb: number): string {
	const rgb = argb & 0xffffff;
	const hex = rgb.toString(16).padStart(6, '0');
	if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5]) {
		return `#${hex[0]}${hex[2]}${hex[4]}`;
	}
	return `#${hex}`;
}

function parseHexColor(hex: string): number | null {
	const cleaned = hex.replace('#', '').trim();
	if (cleaned.length === 3) {
		const r = cleaned[0]! + cleaned[0]!;
		const g = cleaned[1]! + cleaned[1]!;
		const b = cleaned[2]! + cleaned[2]!;
		return Number.parseInt(`ff${r}${g}${b}`, 16);
	}
	if (cleaned.length === 6) {
		return Number.parseInt(`ff${cleaned}`, 16);
	}
	if (cleaned.length === 8) {
		return Number.parseInt(cleaned, 16);
	}
	return null;
}

function toKebabCase(name: string): string {
	return name.replaceAll('_', '-');
}

function getM3ColorNames(): string[] {
	return allDynamicColors.map((color) => toKebabCase(color.name));
}

function createDynamicScheme(sourceArgb: number, isDark: boolean): DynamicScheme {
	return new DynamicScheme({
		sourceColorHcts: [Hct.fromInt(sourceArgb)],
		variant: Variant.TONAL_SPOT,
		contrastLevel: 0,
		specVersion: '2025',
		isDark
	});
}

export function schemeAccentCssVars(sourceArgb: number, isDark: boolean): Record<string, string> {
	const scheme = createDynamicScheme(sourceArgb, isDark);
	const vars: Record<string, string> = {};

	for (const color of allDynamicColors) {
		const kebabCase = toKebabCase(color.name);
		if (!isAccentToken(kebabCase)) continue;
		vars[`--color-${kebabCase}`] = argbToHex(color.getArgb(scheme));
	}

	for (const alias of ACCENT_ALIASES) {
		const source = vars[`--color-${alias.source}`];
		if (source) vars[`--color-${alias.name}`] = source;
	}

	return vars;
}

export function coursePaletteFromSource(sourceArgb: number): CoursePaletteEntry[] {
	const scheme = createDynamicScheme(sourceArgb, false);
	const palettes = [scheme.primaryPalette, scheme.secondaryPalette, scheme.tertiaryPalette];
	const entries: CoursePaletteEntry[] = [];
	for (const tone of [90, 80]) {
		for (const palette of palettes) {
			entries.push({
				background: argbToHex(palette.tone(tone)),
				foreground: argbToHex(palette.tone(10))
			});
		}
	}
	return entries;
}

export function coursePaletteFromSources(argbs: number[]): CoursePaletteEntry[] {
	const palettes = argbs.map((argb) => TonalPalette.fromInt(argb));
	const entries: CoursePaletteEntry[] = [];
	const seen = new Set<string>();

	function pushTone(palette: TonalPalette, tone: number) {
		const background = argbToHex(palette.tone(tone));
		if (seen.has(background) || entries.length >= 6) return;
		seen.add(background);
		entries.push({ background, foreground: argbToHex(palette.tone(10)) });
	}

	for (const palette of palettes) pushTone(palette, 90);
	for (const palette of palettes) pushTone(palette, 80);

	const seed = argbs[0] ?? BRAND_SOURCE_ARGB;
	for (const extra of coursePaletteFromSource(seed)) {
		if (entries.length >= 6) break;
		if (seen.has(extra.background)) continue;
		seen.add(extra.background);
		entries.push(extra);
	}

	return entries;
}

function hostColorCssVars(mode: 'light' | 'dark'): string[] {
	return CHRONOS_HOST_COLOR_KEYS.map(
		(key) => `\t\t--color-${key}: ${CHRONOS_HOST_COLORS[mode][key]};`
	);
}

export function buildGeneratedThemeCss(): string {
	const light = createDynamicScheme(BRAND_SOURCE_ARGB, false);
	const dark = createDynamicScheme(BRAND_SOURCE_ARGB, true);
	const lightVars: string[] = [];
	const darkVars: string[] = [];

	for (const color of allDynamicColors) {
		const kebabCase = toKebabCase(color.name);
		const lightHex = argbToHex(color.getArgb(light));
		const darkHex = argbToHex(color.getArgb(dark));

		lightVars.push(`\t\t--color-${kebabCase}: ${lightHex};`);
		if (lightHex !== darkHex) {
			darkVars.push(`\t\t--color-${kebabCase}: ${darkHex};`);
		}
	}

	lightVars.push(...hostColorCssVars('light'));
	darkVars.push(...hostColorCssVars('dark'));

	const themeInlineVars = [
		...getM3ColorNames().map((name) => `\t--color-${name}: var(--color-${name});`),
		...CHRONOS_COLOR_ALIASES.map(
			(alias) => `\t--color-${alias.name}: var(--color-${alias.source});`
		),
		...CHRONOS_HOST_INLINE_THEME_KEYS.map((key) => `\t--color-${key}: var(--color-${key});`),
		'\t--color-border: var(--color-border-subtle);'
	].join('\n');

	return `/* generated, do not edit */

@layer tokens {
	:root {
${lightVars.join('\n')}
	}

	.dark {
${darkVars.join('\n')}
	}
}

@theme inline {
${themeInlineVars}
}
`;
}

function mergeHostColorsIntoTokens(
	tokens: Record<string, string>,
	mode: 'light' | 'dark'
): Record<string, string> {
	for (const key of CHRONOS_HOST_COLOR_KEYS) {
		tokens[key] = CHRONOS_HOST_COLORS[mode][key];
	}
	return tokens;
}

export function buildM3Tokens(mode: 'light' | 'dark', seedColor?: string): DesignTokens {
	const isDark = mode === 'dark';
	const sourceArgb = (seedColor ? parseHexColor(seedColor) : null) ?? BRAND_SOURCE_ARGB;
	const scheme = createDynamicScheme(sourceArgb, isDark);

	const tokens: Record<string, string> = {};

	for (const color of allDynamicColors) {
		const kebabCase = toKebabCase(color.name);
		tokens[kebabCase] = argbToHex(color.getArgb(scheme));
	}

	mergeHostColorsIntoTokens(tokens, mode);

	return {
		surface: tokens['surface'] ?? (isDark ? '#141318' : '#fef7ff'),
		onSurface: tokens['on-surface'] ?? (isDark ? '#e6e0e9' : '#1d1b20'),
		primary: tokens['primary'] ?? (isDark ? '#a8c7fa' : '#0068b7'),
		onPrimary: tokens['on-primary'] ?? (isDark ? '#003366' : '#ffffff'),
		surfaceVariant: tokens['surface-container-low'] ?? (isDark ? '#1d1b20' : '#f7f2fa'),
		outline: tokens['outline'] ?? (isDark ? '#938f99' : '#79747e'),
		...tokens
	};
}

export function buildM3CoursePalette(sourceArgb: number = BRAND_SOURCE_ARGB): CoursePaint[] {
	return coursePaletteFromSource(sourceArgb);
}

export const m3DefaultTheme: ThemeContribution = {
	id: 'm3-default',
	name: () => 'Material 3 (Default)',
	supportsDynamicColor: true,
	workbenchColors: createWorkbenchColorsFromTokens(buildM3Tokens('light'), buildM3Tokens('dark')),

	getTokens(mode: 'light' | 'dark', seedColor?: string): DesignTokens {
		return buildM3Tokens(mode, seedColor);
	},

	resolveCoursePaint(_course: Course, paletteIndex: number, _mode: 'light' | 'dark'): CoursePaint {
		const palette = buildM3CoursePalette(BRAND_SOURCE_ARGB);
		return palette[Math.abs(paletteIndex) % palette.length]!;
	}
};
