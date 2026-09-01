import type { ChronosEngine, ChronosPlugin, ChronosProfile, Disposable } from '@chronos/core';
import { resolveLayeredPluginConfig } from '@chronos/core';
import { eagerPlugins, deferredPluginLoaders } from './available-plugins.generated';

export const PHASE1_PLUGIN_ID = 'core-shell';

export async function resolveBuiltinPlugin(id: string): Promise<ChronosPlugin | undefined> {
	const eager = eagerPlugins.find((plugin) => plugin.id === id);
	if (eager) return eager;
	const loader = deferredPluginLoaders[id];
	if (loader) return loader();
	return undefined;
}

export async function loadProfilePlugins(
	engine: ChronosEngine,
	profile: ChronosProfile,
	pluginFilter: (pluginId: string) => boolean
): Promise<Disposable[]> {
	const handles: Disposable[] = [];

	for (const profilePlugin of profile.plugins) {
		if (profilePlugin.enabled === false) continue;
		if (!pluginFilter(profilePlugin.id)) continue;

		const targetPlugin = await resolveBuiltinPlugin(profilePlugin.id);
		if (!targetPlugin) {
			console.warn(
				`[ProfileBootstrap] Plugin "${profilePlugin.id}" declared in profile "${profile.profileId}" was not found.`
			);
			continue;
		}

		const profileConfig = {
			...profilePlugin.config,
			...(profilePlugin.disabledSlots?.length ? { disabledSlots: profilePlugin.disabledSlots } : {})
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

		handles.push(await engine.loadPlugin(pluginToLoad));
	}

	return handles;
}

export async function resolveProfileBuiltinPlugins(
	profile: ChronosProfile
): Promise<ChronosPlugin[]> {
	const plugins: ChronosPlugin[] = [];
	for (const profilePlugin of profile.plugins) {
		if (profilePlugin.enabled === false) continue;
		const plugin = await resolveBuiltinPlugin(profilePlugin.id);
		if (plugin) plugins.push(plugin);
	}
	return plugins;
}
