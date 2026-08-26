import type { Disposable } from '../types/env';
import type { IconThemeContribution } from '../theme/icon-theme';

export class IconThemeRegistry implements Disposable {
	private themes = new Map<string, IconThemeContribution>();

	constructor(private onIconThemesChanged?: () => void) {}

	registerIconTheme(theme: IconThemeContribution): Disposable {
		this.themes.set(theme.id, theme);
		this.onIconThemesChanged?.();
		return {
			dispose: () => {
				if (this.themes.get(theme.id) === theme) {
					this.themes.delete(theme.id);
					this.onIconThemesChanged?.();
				}
			}
		};
	}

	getIconTheme(id: string): IconThemeContribution | undefined {
		return this.themes.get(id);
	}

	getIconThemes(): ReadonlyArray<IconThemeContribution> {
		return Array.from(this.themes.values());
	}

	dispose(): void {
		this.themes.clear();
	}
}
