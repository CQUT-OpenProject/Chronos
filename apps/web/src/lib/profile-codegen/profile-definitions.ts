/** Build-time profile → server plugin mapping (keep in sync with profile-registry). */
export const PROFILE_SERVER_PLUGINS: Record<string, readonly string[]> = {
	'chronos-default': [],
	'chronos-cqut': ['source-cqut'],
	'chronos-cqut-offline': []
};

export const SERVER_PLUGIN_MODULES: Record<
	string,
	{ importPath: string; domains: string[]; action: string }
> = {
	'source-cqut': {
		importPath: '@chronos/plugin-source-cqut/server',
		domains: ['cqut.edu.cn'],
		action: 'preview'
	}
};

export function resolveProfileId(): string {
	return process.env.CHRONOS_PROFILE ?? 'chronos-cqut';
}

export function resolveActiveServerPluginIds(profileId: string): string[] {
	return [
		...(PROFILE_SERVER_PLUGINS[profileId] ?? PROFILE_SERVER_PLUGINS['chronos-default'] ?? [])
	];
}
