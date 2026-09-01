import type { ChronosPlugin, ChronosProfile } from '@chronos/core';
import { eagerPlugins, deferredPluginLoaders } from './available-plugins.generated';

export async function resolveBuiltinPlugin(id: string): Promise<ChronosPlugin | undefined> {
	const eager = eagerPlugins.find((plugin) => plugin.id === id);
	if (eager) return eager;
	const loader = deferredPluginLoaders[id];
	if (loader) return loader();
	return undefined;
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
