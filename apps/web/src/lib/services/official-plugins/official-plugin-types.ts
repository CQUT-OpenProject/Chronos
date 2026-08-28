import type { PluginManifest } from '@chronos/core';

export const OFFICIAL_PLUGINS_PLUGIN_ID = 'core.official-plugins';
export const INSTALLED_STORAGE_KEY = 'installed_plugins';

export interface InstalledOfficialPluginRecord {
	manifest: PluginManifest;
	code?: string | null;
	colorsJson?: string | null;
	iconThemeJson?: string | null;
	cssCode?: string | null;
	manifestUrl?: string;
	enabled: boolean;
	installedAt: number;
}

export interface OfficialPluginAssets {
	code?: string | null;
	colorsJson?: string | null;
	iconThemeJson?: string | null;
	cssCode?: string | null;
}

export interface PluginUpdateOffer {
	pluginId: string;
	currentVersion: string;
	latestVersion: string;
	manifest: PluginManifest;
	manifestUrl: string;
}
