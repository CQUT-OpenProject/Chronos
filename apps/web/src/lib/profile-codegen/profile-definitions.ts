/** Build-time profile → plugin mapping (keep in sync with profile-registry). */

export const PROFILE_SERVER_PLUGINS: Record<string, readonly string[]> = {
	'chronos-default': [],
	'chronos-cqut': ['source-cqut'],
	'chronos-cqut-offline': []
};

export const PROFILE_BUILTIN_PLUGINS: Record<string, readonly string[]> = {
	'chronos-default': ['core-shell', 'codec-share'],
	'chronos-cqut': ['core-shell', 'source-cqut', 'codec-share'],
	'chronos-cqut-offline': ['core-shell', 'source-cqut', 'codec-share']
};

export const CLIENT_BUILTIN_PLUGIN_MODULES: Record<
	string,
	{ importPath: string; exportName: string }
> = {
	'core-shell': {
		importPath: '$lib/boot/core-shell',
		exportName: 'coreShellPlugin'
	},
	'codec-share': {
		importPath: '@chronos/plugin-codec-share',
		exportName: 'shareCodecPlugin'
	},
	'source-cqut': {
		importPath: '@chronos/plugin-source-cqut',
		exportName: 'cqutPlugin'
	}
};

/** Literal proxy contract — keep in sync with plugin server manifests and profile-sync.test.ts */
export const SERVER_PLUGIN_MODULES: Record<
	string,
	{ importPath: string; domains: readonly string[]; action: string }
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

export function resolveActiveBuiltinPluginIds(profileId: string): string[] {
	return [
		...(PROFILE_BUILTIN_PLUGINS[profileId] ?? PROFILE_BUILTIN_PLUGINS['chronos-default'] ?? [])
	];
}
