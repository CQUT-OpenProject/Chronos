import type { ChronosEngine } from '../runtime/engine';
import type { ChronosPlugin } from '../types/context';
import type { Disposable } from '../types/services';
import { type ChronosProfile, resolveLayeredPluginConfig } from './profile';

export class ProfileManager implements Disposable {
	private activeProfile: ChronosProfile | null = null;
	private loadedHandles: Disposable[] = [];

	constructor(private engine: ChronosEngine) {}

	getActiveProfile(): ChronosProfile | null {
		return this.activeProfile;
	}

	async applyProfile(
		profile: ChronosProfile,
		availablePlugins: ChronosPlugin[]
	): Promise<Disposable> {
		// Clean up previous profile loads
		this.disposeLoaded();
		this.activeProfile = profile;

		// 1. Apply theme preset if specified
		if (profile.defaultTheme) {
			this.engine.setTheme(profile.defaultTheme);
		}

		// 2. Apply user preferences preset if specified
		if (profile.preferences) {
			await this.engine.actions.updatePreferences(profile.preferences);
		}

		// 3. Assemble and activate plugins according to profile configuration
		const pluginMap = new Map<string, ChronosPlugin>();
		for (const plugin of availablePlugins) {
			pluginMap.set(plugin.id, plugin);
		}

		for (const profilePlugin of profile.plugins) {
			if (profilePlugin.enabled === false) {
				continue;
			}

			const targetPlugin = pluginMap.get(profilePlugin.id);
			if (!targetPlugin) {
				console.warn(
					`[ProfileManager] Plugin "${profilePlugin.id}" declared in profile "${profile.profileId}" was not found in available plugins.`
				);
				continue;
			}

			// Pre-configure layered defaults (profile disabledSlots → plugin config)
			const profileConfig = {
				...profilePlugin.config,
				...(profilePlugin.disabledSlots?.length
					? { disabledSlots: profilePlugin.disabledSlots }
					: {})
			};
			const layeredDefaultConfig = resolveLayeredPluginConfig(
				targetPlugin.defaultConfig,
				undefined,
				profileConfig,
				undefined
			);

			const pluginToLoad: ChronosPlugin = {
				...targetPlugin,
				defaultConfig: layeredDefaultConfig
			};

			const handle = await this.engine.loadPlugin(pluginToLoad);
			this.loadedHandles.push(handle);
		}

		return {
			dispose: () => {
				this.disposeLoaded();
			}
		};
	}

	private disposeLoaded(): void {
		for (const handle of this.loadedHandles) {
			try {
				handle.dispose();
			} catch (err) {
				console.error('[ProfileManager] Error disposing loaded plugin:', err);
			}
		}
		this.loadedHandles = [];
	}

	dispose(): void {
		this.disposeLoaded();
		this.activeProfile = null;
	}
}
