import type { Course, CoursePaint, DesignTokens, ThemeContribution } from '@chronos/core';

export const YUMEMITA_THEME_ID = 'yumemita';

export const YUMEMITA_PRIMARY = '#2288dd';
export const YUMEMITA_SECONDARY = '#ff7788';
export const YUMEMITA_ON_ACCENT = '#fff';

const EASTER_EGG_COURSE_BACKGROUNDS = [
	'#FFEE55',
	'#FFBBCC',
	'#4477CC',
	'#9977CC',
	'#EE5577',
	'#4D5B4C'
] as const;

function relativeLuminance(hex: string): number {
	const value = Number.parseInt(hex.slice(1), 16);
	const channel = (shift: number) => {
		const srgb = ((value >> shift) & 255) / 255;
		return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

function onColorForBackground(hex: string): string {
	return relativeLuminance(hex) > 0.55 ? '#1a1a1a' : '#fff';
}

export type CoursePaletteEntry = { background: string; foreground: string };

export const EASTER_EGG_PALETTE_ENTRIES: CoursePaletteEntry[] = EASTER_EGG_COURSE_BACKGROUNDS.map(
	(background) => ({ background, foreground: onColorForBackground(background) })
);

export function buildYumemitaThemeTokens(_mode: 'light' | 'dark'): DesignTokens {
	const primary = YUMEMITA_PRIMARY;
	const secondary = YUMEMITA_SECONDARY;
	const onAccent = YUMEMITA_ON_ACCENT;

	return {
		surface: _mode === 'dark' ? '#1e2026' : '#f9f9fe',
		onSurface: _mode === 'dark' ? '#f8fafc' : '#2e333a',
		primary,
		onPrimary: onAccent,
		surfaceVariant: _mode === 'dark' ? '#24262e' : '#eceef5',
		outline: _mode === 'dark' ? '#334155' : '#aeb2bb',
		'primary-dim': primary,
		'primary-container': primary,
		'on-primary-container': onAccent,
		'inverse-primary': primary,
		'on-on-primary': primary,
		'primary-container-subtle': primary,
		'on-primary-container-subtle': onAccent,
		secondary,
		'secondary-dim': secondary,
		'on-secondary': onAccent,
		'secondary-container': secondary,
		'on-secondary-container': onAccent,
		'secondary-container-subtle': secondary,
		'on-secondary-container-subtle': onAccent
	};
}

export const yumemitaThemeContribution: ThemeContribution = {
	id: YUMEMITA_THEME_ID,
	name: () => 'YUMEMITA',
	supportsDynamicColor: false,
	getTokens: buildYumemitaThemeTokens,
	resolveCoursePaint(course: Course, paletteIndex: number, _mode: 'light' | 'dark'): CoursePaint {
		if (course.color && course.textColor) {
			return { background: course.color, foreground: course.textColor };
		}
		const entry =
			EASTER_EGG_PALETTE_ENTRIES[Math.abs(paletteIndex) % EASTER_EGG_PALETTE_ENTRIES.length]!;
		return { background: entry.background, foreground: entry.foreground };
	}
};
