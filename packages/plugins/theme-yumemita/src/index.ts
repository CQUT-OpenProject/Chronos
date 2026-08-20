import type { ChronosContext, ChronosPlugin } from '@chronos/core';
import {
	YUMEMITA_THEME_ID,
	yumemitaThemeContribution,
	buildYumemitaThemeTokens,
	EASTER_EGG_PALETTE_ENTRIES,
	YUMEMITA_PRIMARY,
	YUMEMITA_SECONDARY
} from './yumemita-theme';

export const YUMEMITA_PLUGIN_ID = 'theme-yumemita';

export {
	YUMEMITA_THEME_ID,
	yumemitaThemeContribution,
	buildYumemitaThemeTokens,
	EASTER_EGG_PALETTE_ENTRIES,
	YUMEMITA_PRIMARY,
	YUMEMITA_SECONDARY
};

export const yumemitaThemePlugin: ChronosPlugin = {
	id: YUMEMITA_PLUGIN_ID,
	name: () => 'YUMEMITA',
	version: '1.0.0',
	description: () => 'YUMEMITA 主题',
	category: 'theme',
	author: 'Chronos Community',

	apply(ctx: ChronosContext) {
		ctx.registerSlot('theme.definition', yumemitaThemeContribution);
	}
};
