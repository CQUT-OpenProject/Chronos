import type { ChronosPlugin, ChronosProfile } from '@chronos/core';
import { DEFAULT_VISUAL_THEME_ID } from '@chronos/core';
import { availablePlugins } from './available-plugins.generated';

declare const __CHRONOS_PROFILE__: string;

export { availablePlugins };

const defaultProfile: ChronosProfile = {
	profileId: 'chronos-default',
	name: 'Chronos 标准开源版',
	version: '0.3.0',
	description: '包含分享短链与标准备份能力',
	defaultTheme: DEFAULT_VISUAL_THEME_ID,
	defaultImportSlot: 'share-link',
	plugins: [
		{ id: 'core-shell', enabled: true },
		{ id: 'codec-share', enabled: true }
	]
};

const cqutProfile: ChronosProfile = {
	profileId: 'chronos-cqut',
	name: '重庆理工大学在线版',
	version: '0.3.0',
	description: '专为重庆理工大学定制，内置知行理工教务直连与校区专属节次',
	defaultTheme: DEFAULT_VISUAL_THEME_ID,
	defaultImportSlot: 'cqut-online',
	plugins: [
		{ id: 'core-shell', enabled: true },
		{
			id: 'source-cqut',
			enabled: true
		},
		{ id: 'codec-share', enabled: true }
	]
};

const cqutOfflineProfile: ChronosProfile = {
	profileId: 'chronos-cqut-offline',
	name: '重庆理工大学离线版',
	version: '0.3.0',
	description: 'HTML 课表导入与分享短链，不含知行理工在线同步',
	defaultTheme: DEFAULT_VISUAL_THEME_ID,
	defaultImportSlot: 'edu-html',
	plugins: [
		{ id: 'core-shell', enabled: true },
		{
			id: 'source-cqut',
			enabled: true,
			disabledSlots: ['cqut-online']
		},
		{ id: 'codec-share', enabled: true }
	]
};

const profileMap: Record<string, ChronosProfile> = {
	'chronos-default': defaultProfile,
	'chronos-cqut': cqutProfile,
	'chronos-cqut-offline': cqutOfflineProfile
};

/** Every profile known to the host (single runtime source of truth). */
export const registeredProfiles: readonly ChronosProfile[] = Object.values(profileMap);

export function resolveActiveProfile(): ChronosProfile {
	const profileId =
		typeof __CHRONOS_PROFILE__ !== 'undefined' ? __CHRONOS_PROFILE__ : 'chronos-cqut';
	return profileMap[profileId] ?? defaultProfile;
}

export function getAvailablePluginsForProfile(profile: ChronosProfile): ChronosPlugin[] {
	const enabledIds = new Set(
		profile.plugins.filter((entry) => entry.enabled !== false).map((entry) => entry.id)
	);
	return availablePlugins.filter((plugin) => enabledIds.has(plugin.id));
}
