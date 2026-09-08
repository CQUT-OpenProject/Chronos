import type { Disposable } from '../types/env';
import type { IconThemeContribution } from '../theme/icon-theme';
import type { HierarchicalSlotRegistry } from './hierarchical-slot-registry';

export class IconThemeRegistry implements Disposable {
	constructor(
		private slots: HierarchicalSlotRegistry,
		private onIconThemesChanged?: () => void
	) {}

	registerIconTheme(theme: IconThemeContribution, ownerPluginId?: string): Disposable {
		const handle = this.slots.register('theme.icon.definition', theme, ownerPluginId);
		this.onIconThemesChanged?.();
		return {
			dispose: () => {
				handle.dispose();
				this.onIconThemesChanged?.();
			}
		};
	}

	getIconTheme(id: string): IconThemeContribution | undefined {
		return this.slots.getSlotItem('theme.icon.definition', id) as IconThemeContribution | undefined;
	}

	getIconThemes(): ReadonlyArray<IconThemeContribution> {
		return this.slots.get('theme.icon.definition') as ReadonlyArray<IconThemeContribution>;
	}

	dispose(): void {
		// slots lifecycle is managed by the host
	}
}
