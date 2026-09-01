import type { ChronosEngine } from '../runtime/engine';
import type { ChronosPlugin } from '../types/context';
import type { Disposable } from '../types/services';
import { type ChronosProfile, resolveLayeredPluginConfig } from './profile';

export type ResolveProfilePlugin = (id: string) => Promise<ChronosPlugin | undefined>;

export class ProfileManager implements Disposable {
	private activeProfile: ChronosProfile | null = null;
	private loadedHandles: Disposable[] = [];
	private loadedPlugins: ChronosPlugin[] = [];

	constructor(private engine: ChronosEngine) {}

	getActiveProfile(): ChronosProfile | null {
		return this.activeProfile;
	}

	listLoadedPlugins(): readonly ChronosPlugin[] {
		return this.loadedPlugins;
	}

	async loadPlugins(
		profile: ChronosProfile,
		resolvePlugin: ResolveProfilePlugin,
		filter: (pluginId: string) => boolean = () => true
	): Promise<void> {
		this.activeProfile = profile;
		await this.loadMatching(profile, resolvePlugin, filter);
	}

	async applyProfile(
		profile: ChronosProfile,
		resolvePlugin: ResolveProfilePlugin
	): Promise<Disposable> {
		this.disposeLoaded();
		this.activeProfile = profile;

		if (profile.defaultTheme) {
			this.engine.setTheme(profile.defaultTheme);
		}

		if (profile.preferences) {
			await this.engine.updatePreferences(profile.preferences);
		}

		await this.loadMatching(profile, resolvePlugin, () => true);

		return {
			dispose: () => {
				this.disposeLoaded();
			}
		};
	}

	private async loadMatching(
		profile: ChronosProfile,
		resolvePlugin: ResolveProfilePlugin,
		filter: (pluginId: string) => boolean
	): Promise<void> {
		for (const profilePlugin of profile.plugins) {
			if (profilePlugin.enabled === false) continue;
			if (!filter(profilePlugin.id)) continue;

			const targetPlugin = await resolvePlugin(profilePlugin.id);
			if (!targetPlugin) {
				console.warn(
					`[ProfileManager] Plugin "${profilePlugin.id}" declared in profile "${profile.profileId}" was not found.`
				);
				continue;
			}

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
			this.loadedPlugins.push(pluginToLoad);
		}
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
		this.loadedPlugins = [];
	}

	dispose(): void {
		this.disposeLoaded();
		this.activeProfile = null;
	}
}
