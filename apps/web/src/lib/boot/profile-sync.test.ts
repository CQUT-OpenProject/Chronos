import { describe, expect, it } from 'vite-plus/test';
import { registeredProfiles } from './profile-registry';
import {
	CHRONOS_PROFILES,
	SERVER_PLUGIN_MODULES,
	CLIENT_BUILTIN_PLUGIN_MODULES,
	enabledBuiltinPluginIds,
	enabledServerPluginIds,
	resolveActiveBuiltinPluginIds,
	resolveActiveServerPluginIds
} from '$lib/profile-codegen/profile-definitions';

describe('profile definitions single source', () => {
	it('exposes the same profile ids at runtime and in codegen input', () => {
		const registryIds = registeredProfiles.map((p) => p.profileId).sort();
		const definitionIds = Object.keys(CHRONOS_PROFILES).sort();
		expect(registryIds).toEqual(definitionIds);
	});

	it('derives server plugins from the server flag on enabled builtins', () => {
		expect(enabledServerPluginIds(CHRONOS_PROFILES['chronos-cqut']!)).toEqual(['source-cqut']);
		expect(enabledServerPluginIds(CHRONOS_PROFILES['chronos-cqut-offline']!)).toEqual([]);
		expect(enabledServerPluginIds(CHRONOS_PROFILES['chronos-default']!)).toEqual([]);
	});

	it('references only plugin ids known to the profiles', () => {
		const known = new Set(registeredProfiles.flatMap((p) => p.plugins.map((e) => e.id)));
		for (const serverPluginId of Object.keys(SERVER_PLUGIN_MODULES)) {
			expect(known.has(serverPluginId)).toBe(true);
		}
	});

	it('keeps proxy domains on the server module table', () => {
		expect(SERVER_PLUGIN_MODULES['source-cqut']?.domains).toEqual(['cqut.edu.cn']);
	});

	it('codegen builtin imports cover every enabled profile plugin', () => {
		const profileId = process.env.CHRONOS_PROFILE ?? 'chronos-cqut';
		for (const pluginId of resolveActiveBuiltinPluginIds(profileId)) {
			expect(CLIENT_BUILTIN_PLUGIN_MODULES[pluginId]).toBeDefined();
		}
		for (const pluginId of resolveActiveServerPluginIds(profileId)) {
			expect(SERVER_PLUGIN_MODULES[pluginId]).toBeDefined();
		}
	});

	it('lists only enabled ids as builtins', () => {
		for (const profile of registeredProfiles) {
			expect(enabledBuiltinPluginIds(profile)).toEqual(
				profile.plugins.filter((entry) => entry.enabled !== false).map((entry) => entry.id)
			);
		}
	});
});
