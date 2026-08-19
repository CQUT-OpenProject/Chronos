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
			getTokens: () => ({
				surface: '#2e3440',
				onSurface: '#eceff4',
				primary: '#88c0d0',
				onPrimary: '#2e3440',
				surfaceVariant: '#3b4252',
				outline: '#4c566a'
			})
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
