export interface PluginProfileConfig {
	id: string;
	enabled?: boolean;
	/** Slot IDs to skip when activating this plugin (e.g. `cqut-online`). */
	disabledSlots?: string[];
	/** When true, codegen emits a plugin-server proxy route for this builtin. */
	server?: boolean;
	config?: Record<string, unknown>;
}

export interface ChronosProfile {
	profileId: string;
	name: string;
	description?: string;
	plugins: PluginProfileConfig[];
	defaultTheme?: string;
	/** Initial import.source.tab slot id when opening the import screen. */
	defaultImportSlot?: string;
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
