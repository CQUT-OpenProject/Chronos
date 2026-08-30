import { describe, it, expect, vi } from 'vite-plus/test';
import { ThemeRegistry } from '../src/runtime/theme-registry';
import type { ThemeContribution } from '../src/types/contributions';

describe('ThemeRegistry in @chronos/core', () => {
	it('registers, retrieves, lists and disposes theme contributions', () => {
		const onThemesChanged = vi.fn();
		const registry = new ThemeRegistry(onThemesChanged);

		const theme: ThemeContribution = {
			id: 'nord',
			name: 'Nord Theme',
			workbenchColors: {
				light: { 'color.surface': '#eceff4' },
				dark: { 'color.surface': '#2e3440' }
			}
		};

		const sub = registry.registerTheme(theme);
		expect(onThemesChanged).toHaveBeenCalledTimes(1);
		expect(registry.getTheme('nord')).toBe(theme);
		expect(registry.getThemes()).toEqual([theme]);

		sub.dispose();
		expect(onThemesChanged).toHaveBeenCalledTimes(2);
		expect(registry.getTheme('nord')).toBeUndefined();
		expect(registry.getThemes()).toEqual([]);
	});
});
