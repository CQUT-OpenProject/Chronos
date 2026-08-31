import { describe, expect, it } from 'vite-plus/test';
import { registeredProfiles } from './profile-registry';
import {
	PROFILE_SERVER_PLUGINS,
	PROFILE_BUILTIN_PLUGINS,
	SERVER_PLUGIN_MODULES,
	CLIENT_BUILTIN_PLUGIN_MODULES,
	resolveActiveBuiltinPluginIds
} from '$lib/profile-codegen/profile-definitions';

/**
 * Gate against drift between the runtime profile registry and the build-time
 * codegen input. These two modules used to be kept in sync by comment only.
 */
describe('profile registry ↔ codegen definitions sync', () => {
	it('covers exactly the same profile ids', () => {
		const registryIds = registeredProfiles.map((p) => p.profileId).sort();
		const definitionIds = Object.keys(PROFILE_SERVER_PLUGINS).sort();
		expect(registryIds).toEqual(definitionIds);
	});

	it('lists only enabled registry plugins as server plugins', () => {
		for (const profile of registeredProfiles) {
			const enabled = new Set(
				profile.plugins.filter((entry) => entry.enabled !== false).map((entry) => entry.id)
			);
			for (const serverPluginId of PROFILE_SERVER_PLUGINS[profile.profileId] ?? []) {
				expect(enabled.has(serverPluginId)).toBe(true);
				expect(SERVER_PLUGIN_MODULES[serverPluginId]).toBeDefined();
			}
		}
	});

	it('references only plugin ids known to the registry', () => {
		const known = new Set(registeredProfiles.flatMap((p) => p.plugins.map((e) => e.id)));
		for (const serverPluginId of Object.keys(SERVER_PLUGIN_MODULES)) {
			expect(known.has(serverPluginId)).toBe(true);
		}
	});

	it('derives proxy domains from plugin server manifests', () => {
		expect(SERVER_PLUGIN_MODULES['source-cqut']?.domains).toEqual(['cqut.edu.cn']);
	});

	it('codegen builtin imports are a subset of enabled profile plugins', () => {
		const profileId = process.env.CHRONOS_PROFILE ?? 'chronos-cqut';
		const enabled = new Set(
			(registeredProfiles.find((p) => p.profileId === profileId) ?? registeredProfiles[0]!).plugins
				.filter((entry) => entry.enabled !== false)
				.map((entry) => entry.id)
		);
		for (const pluginId of resolveActiveBuiltinPluginIds(profileId)) {
			expect(enabled.has(pluginId)).toBe(true);
			expect(CLIENT_BUILTIN_PLUGIN_MODULES[pluginId]).toBeDefined();
		}
	});

	it('builtin plugin definitions cover every profile-enabled builtin id', () => {
		for (const profile of registeredProfiles) {
			const enabled = profile.plugins
				.filter((entry) => entry.enabled !== false)
				.map((entry) => entry.id);
			for (const pluginId of enabled) {
				if (PROFILE_BUILTIN_PLUGINS[profile.profileId]?.includes(pluginId)) {
					expect(CLIENT_BUILTIN_PLUGIN_MODULES[pluginId]).toBeDefined();
				}
			}
		}
	});
});
