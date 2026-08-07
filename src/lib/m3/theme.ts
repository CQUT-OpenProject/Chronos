import { DynamicScheme, Hct, Variant } from '@ktibow/material-color-utilities-nightly';
import { colors, genCSS } from 'm3-svelte/etc/colors';

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

export const chronosM3Theme = genCSS(light, dark, colors);
