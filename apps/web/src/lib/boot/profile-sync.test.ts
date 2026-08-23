import { describe, expect, it } from 'vite-plus/test';
import { registeredProfiles } from './profile-registry';
import {
	PROFILE_SERVER_PLUGINS,
	SERVER_PLUGIN_MODULES
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
});
