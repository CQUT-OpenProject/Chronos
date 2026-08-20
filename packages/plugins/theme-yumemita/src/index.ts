import type { ChronosContext, ChronosPlugin } from '@chronos/core';
import {
	YUMEMITA_THEME_ID,
	yumemitaThemeContribution,
	buildYumemitaThemeTokens,
	YUMEMITA_PALETTE_ENTRIES,
	YUMEMITA_PRIMARY,
	YUMEMITA_SECONDARY
} from './yumemita-theme';

export const YUMEMITA_PLUGIN_ID = 'theme-yumemita';

export {
	YUMEMITA_THEME_ID,
	yumemitaThemeContribution,
	buildYumemitaThemeTokens,
	YUMEMITA_PALETTE_ENTRIES,
	YUMEMITA_PRIMARY,
	YUMEMITA_SECONDARY
};

export const yumemitaThemePlugin: ChronosPlugin = {
	id: YUMEMITA_PLUGIN_ID,
	name: () => 'YUME∞MITA',
	version: '1.0.0',
	description: () => 'YUME∞MITA 主题',
	category: 'theme',
	author: 'Chronos Community',

	apply(ctx: ChronosContext) {
		ctx.registerSlot('theme.definition', yumemitaThemeContribution);
	}
};
