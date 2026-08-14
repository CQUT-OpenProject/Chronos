import {
	ContrastCurve,
	DynamicColor,
	DynamicScheme,
	Hct,
	MaterialDynamicColors,
	TonalPalette,
	Variant
} from '@ktibow/material-color-utilities-nightly';
import type { CoursePaletteEntry } from '$lib/parsers/course-palette';

/** Chronos brand #0068B7 */
export const BRAND_SOURCE_ARGB = 0xff0068b7;

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

function argbToHex(argb: number) {
	const rgb = argb & 0xffffff;
	const hex = rgb.toString(16).padStart(6, '0');
	if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5]) {
		return `#${hex[0]}${hex[2]}${hex[4]}`;
	}
	return `#${hex}`;
}

function toKebabCase(name: string) {
	return name.replaceAll('_', '-');
}

function getM3ColorNames(): string[] {
	return allDynamicColors.map((color) => toKebabCase(color.name));
}

function createDynamicScheme(sourceArgb: number, isDark: boolean) {
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

export function buildGeneratedThemeCss() {
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

	const themeInlineVars = [
		...getM3ColorNames().map((name) => `\t--color-${name}: var(--color-${name});`),
		...CHRONOS_COLOR_ALIASES.map(
			(alias) => `\t--color-${alias.name}: var(--color-${alias.source});`
		)
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
