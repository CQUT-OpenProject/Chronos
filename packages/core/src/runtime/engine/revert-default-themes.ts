import type { UserPreferences } from '../../domain/preferences';
import { PALETTE_MODE_VIBRANT } from '../../domain/preferences';
import { DEFAULT_VISUAL_THEME_ID } from '../../theme/theme-defaults';
import type { ThemeRegistry } from '../theme-registry';

export interface RevertDefaultThemesInput {
	activeThemeId: string;
	preferences: UserPreferences;
	themes: ThemeRegistry;
}

export interface RevertDefaultThemesPlan {
	nextThemeId?: string;
	preferencesPatch: Partial<UserPreferences>;
}

/** Computes theme/preference rollback when plugin-owned themes are removed. */
export function planRevertToDefaultThemes(
	input: RevertDefaultThemesInput
): RevertDefaultThemesPlan | null {
	const patch: Partial<UserPreferences> = {};
	let reverted = false;
	let nextThemeId: string | undefined;

	if (
		input.activeThemeId !== DEFAULT_VISUAL_THEME_ID &&
		!input.themes.getTheme(input.activeThemeId)
	) {
		nextThemeId = DEFAULT_VISUAL_THEME_ID;
		patch.paletteMode = PALETTE_MODE_VIBRANT;
		patch.visualThemeId = DEFAULT_VISUAL_THEME_ID;
		reverted = true;
	}

	if (
		input.preferences.paletteMode !== PALETTE_MODE_VIBRANT &&
		!input.themes.getTheme(input.preferences.paletteMode)
	) {
		if (!reverted) {
			nextThemeId = DEFAULT_VISUAL_THEME_ID;
		}
		patch.paletteMode = PALETTE_MODE_VIBRANT;
		patch.visualThemeId = DEFAULT_VISUAL_THEME_ID;
	}

	if (Object.keys(patch).length === 0) {
		return null;
	}

	return { nextThemeId, preferencesPatch: patch };
}
