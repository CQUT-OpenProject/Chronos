export interface PluginProfileConfig {
	id: string;
	enabled?: boolean;
	config?: Record<string, unknown>;
}

export interface ChronosProfile {
	profileId: string;
	name: string;
	version: string;
	description?: string;
	plugins: PluginProfileConfig[];
	defaultTheme?: string;
	preferences?: Record<string, unknown>;
}

/**
 * Merges configuration for a plugin across 4 distinct layers:
 * 1. Default Schema (plugin.defaultConfig)
 * 2. Manifest Bundle Config
 * 3. Profile Config (profile.plugins[i].config)
 * 4. User Persistent Patch (storage __config__)
 */
export function resolveLayeredPluginConfig<T extends Record<string, unknown>>(
	schemaDefault?: Partial<T>,
	manifestConfig?: Partial<T>,
	profileConfig?: Partial<T>,
	userPersistentPatch?: Partial<T>
): T {
	return {
		...schemaDefault,
		...manifestConfig,
		...profileConfig,
		...userPersistentPatch
	} as T;
}
