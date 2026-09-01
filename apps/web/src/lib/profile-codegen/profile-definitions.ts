import type { ChronosProfile } from '@chronos/core';

/** Builtins loaded before first timetable paint; all others are deferred dynamic imports. */
export const EAGER_BUILTIN_PLUGIN_IDS = ['core-shell'] as const;

const DEFAULT_PROFILE: ChronosProfile = {
	profileId: 'chronos-default',
	name: 'Chronos 标准开源版',
	description: '包含分享短链与标准备份能力',
	defaultTheme: 'm3-default',
	defaultImportSlot: 'share-link',
	plugins: [
		{ id: 'core-shell', enabled: true },
		{ id: 'codec-share', enabled: true }
	]
};

const CQUT_PROFILE: ChronosProfile = {
	profileId: 'chronos-cqut',
	name: '重庆理工大学在线版',
	description: '专为重庆理工大学定制，内置知行理工教务直连与校区专属节次',
	defaultTheme: 'm3-default',
	defaultImportSlot: 'cqut-online',
	plugins: [
		{ id: 'core-shell', enabled: true },
		{ id: 'source-cqut', enabled: true, server: true },
		{ id: 'codec-share', enabled: true }
	]
};

const CQUT_OFFLINE_PROFILE: ChronosProfile = {
	profileId: 'chronos-cqut-offline',
	name: '重庆理工大学离线版',
	description: 'HTML 课表导入与分享短链，不含知行理工在线同步',
	defaultTheme: 'm3-default',
	defaultImportSlot: 'edu-html',
	plugins: [
		{ id: 'core-shell', enabled: true },
		{ id: 'source-cqut', enabled: true, disabledSlots: ['cqut-online'] },
		{ id: 'codec-share', enabled: true }
	]
};

export const CHRONOS_PROFILES: Record<string, ChronosProfile> = {
	'chronos-default': DEFAULT_PROFILE,
	'chronos-cqut': CQUT_PROFILE,
	'chronos-cqut-offline': CQUT_OFFLINE_PROFILE
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

/** Literal proxy contract — keep in sync with plugin server manifests. */
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

export type ProfileResolveEnv = {
	CHRONOS_PROFILE?: string;
	CHRONOS_DEPLOY_TARGET?: string;
};

export function resolveProfileId(env: ProfileResolveEnv = process.env): string {
	if (env.CHRONOS_PROFILE) return env.CHRONOS_PROFILE;
	return env.CHRONOS_DEPLOY_TARGET === 'pages' ? 'chronos-default' : 'chronos-cqut';
}

function resolveProfile(profileId: string): ChronosProfile {
	return CHRONOS_PROFILES[profileId] ?? DEFAULT_PROFILE;
}

export function enabledBuiltinPluginIds(profile: ChronosProfile): string[] {
	return profile.plugins.filter((entry) => entry.enabled !== false).map((entry) => entry.id);
}

export function enabledServerPluginIds(profile: ChronosProfile): string[] {
	return profile.plugins
		.filter((entry) => entry.enabled !== false && entry.server)
		.map((entry) => entry.id);
}

export function resolveActiveServerPluginIds(profileId: string): string[] {
	return enabledServerPluginIds(resolveProfile(profileId));
}

export function resolveActiveBuiltinPluginIds(profileId: string): string[] {
	return enabledBuiltinPluginIds(resolveProfile(profileId));
}
