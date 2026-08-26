import type { Disposable } from '../types/env';
import type { ThemeContribution } from '../types/contributions';

export class ThemeRegistry implements Disposable {
	private themes = new Map<string, ThemeContribution>();

	constructor(private onThemesChanged?: () => void) {}

	registerTheme(theme: ThemeContribution): Disposable {
		this.themes.set(theme.id, theme);
		this.onThemesChanged?.();
		return {
			dispose: () => {
				if (this.themes.get(theme.id) === theme) {
					this.themes.delete(theme.id);
					this.onThemesChanged?.();
				}
			}
		};
	}

	getTheme(id: string): ThemeContribution | undefined {
		return this.themes.get(id);
	}

	getThemes(): ReadonlyArray<ThemeContribution> {
		return Array.from(this.themes.values());
	}

	dispose(): void {
		this.themes.clear();
	}
}
