import type { ChronosPlugin, ChronosProfile } from '@chronos/core';
import { cqutPlugin } from '@chronos/plugin-source-cqut';
import { htmlParserPlugin } from '@chronos/plugin-parser-html';
import { shareCodecPlugin } from '@chronos/plugin-codec-share';

declare const __CHRONOS_PROFILE__: string;

export const availablePlugins: ChronosPlugin[] = [cqutPlugin, htmlParserPlugin, shareCodecPlugin];

const defaultProfile: ChronosProfile = {
	profileId: 'chronos-default',
	name: 'Chronos 标准开源版',
	version: '0.3.0',
	description: '包含标准 HTML 课表导入、分享短链与标准备份能力',
	defaultTheme: 'm3-default',
	plugins: [
		{ id: 'parser-html', enabled: true },
		{ id: 'codec-share', enabled: true }
	],
	preferences: {
		showNonCurrentWeekCourses: false,
		showSaturday: true,
		showSunday: true
	}
};

const cqutProfile: ChronosProfile = {
	profileId: 'chronos-cqut',
	name: '重庆理工大学定制版',
	version: '0.3.0',
	description: '专为重庆理工大学定制，内置知行理工教务直连与校区专属节次',
	defaultTheme: 'm3-default',
	plugins: [
		{
			id: 'source-cqut',
			enabled: true,
			config: { campusId: 'liangjiang' }
		},
		{ id: 'parser-html', enabled: true },
		{ id: 'codec-share', enabled: true }
	],
	preferences: {
		showNonCurrentWeekCourses: false,
		showSaturday: true,
		showSunday: true
	}
};

const profileMap: Record<string, ChronosProfile> = {
	'chronos-default': defaultProfile,
	'chronos-cqut': cqutProfile
};

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
