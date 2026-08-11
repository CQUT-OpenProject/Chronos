import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	ContrastCurve,
	DynamicColor,
	DynamicScheme,
	Hct,
	MaterialDynamicColors,
	Variant
} from '@ktibow/material-color-utilities-nightly';

/** Chronos brand #0068B7 */
const SOURCE_COLOR = Hct.fromInt(0xff0068b7);

const schemeArgs = {
	sourceColorHcts: [SOURCE_COLOR],
	variant: Variant.TONAL_SPOT,
	contrastLevel: 0,
	specVersion: '2025' as const
};

const light = new DynamicScheme({ ...schemeArgs, isDark: false });
const dark = new DynamicScheme({ ...schemeArgs, isDark: true });

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

export function buildGeneratedThemeCss() {
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

const generatedThemePath = resolve(dirname(fileURLToPath(import.meta.url)), 'generated-theme.css');

export function writeGeneratedThemeCss() {
	const css = buildGeneratedThemeCss();
	try {
		const existing = readFileSync(generatedThemePath, 'utf8');
		if (existing === css) {
			return generatedThemePath;
		}
	} catch {
		// File does not exist yet
	}
	writeFileSync(generatedThemePath, css, 'utf8');
	return generatedThemePath;
}
