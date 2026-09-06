import type { ThemeContribution } from '@chronos/core';
import { m3DefaultWorkbenchColors } from './m3-default-workbench.generated';

export const m3DefaultTheme: ThemeContribution = {
	id: 'm3-default',
	name: () => 'Material 3 (Default)',
	supportsDynamicColor: true,
	workbenchColors: m3DefaultWorkbenchColors
};
