import type { Disposable } from '../types/env';
import type { ThemeContribution } from '../types/contributions';
import type { HierarchicalSlotRegistry } from './hierarchical-slot-registry';

export class ThemeRegistry implements Disposable {
	constructor(
		private slots: HierarchicalSlotRegistry,
		private onThemesChanged?: () => void
	) {}

	registerTheme(theme: ThemeContribution, ownerPluginId?: string): Disposable {
		const handle = this.slots.register('theme.definition', theme, ownerPluginId);
		this.onThemesChanged?.();
		return {
			dispose: () => {
				handle.dispose();
				this.onThemesChanged?.();
			}
		};
	}

	getTheme(id: string): ThemeContribution | undefined {
		return this.slots.getSlotItem('theme.definition', id) as ThemeContribution | undefined;
	}

	getThemes(): ReadonlyArray<ThemeContribution> {
		return this.slots.get('theme.definition') as ReadonlyArray<ThemeContribution>;
	}

	dispose(): void {
		// slots lifecycle is managed by the host
	}
}
