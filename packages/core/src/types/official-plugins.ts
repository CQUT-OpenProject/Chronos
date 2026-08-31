import type { ConfigSchema } from '../schema/schema';

export type BundleFormat = 'esm';

export interface PluginManifest {
	id: string;
	name: Record<string, string>;
	version: string;
	description: Record<string, string>;
	author: string;
	type: 'theme' | 'source' | 'tool' | 'exporter';
	bundleFormat: BundleFormat;
	/** ESM plugin bundle (optional when colorsUrl is provided for theme plugins). */
	bundleUrl?: string;
	sha256?: string;
	/** Optional stylesheet shipped alongside the bundle (tool plugins with rich UI). */
	cssUrl?: string;
	cssSha256?: string;
	/** VS Code–style color theme JSON (theme plugins). */
	colorsUrl?: string;
	colorsSha256?: string;
	/** Theme contribution id declared by the shipped colors JSON (single source, host never guesses). */
	themeId?: string;
	iconThemeUrl?: string;
	iconThemeSha256?: string;
	allowedDomains?: string[];
	configSchema?: ConfigSchema<Record<string, unknown>>;
	icon?: string;
	homepage?: string;
}

/** Official plugin catalog listing manifest URLs. */
export interface OfficialPluginCatalog {
	version: number;
	updatedAt: number;
	/** Official plugin manifest URLs (same-origin or GitHub raw). */
	manifests: string[];
}
