import type { ConfigSchema } from '../schema/schema';

/** Current Chronos engine API version for official plugin compatibility checks. */
export const CHRONOS_ENGINE_VERSION = '0.4.0';

export type BundleFormat = 'esm';

export interface PluginManifest {
	id: string;
	name: Record<string, string>;
	version: string;
	description: Record<string, string>;
	author: string;
	type: 'theme' | 'source' | 'tool' | 'exporter';
	bundleFormat: BundleFormat;
	minEngineVersion: string;
	bundleUrl: string;
	sha256: string;
	/** Optional Ed25519 signature (future verification). */
	signature?: string;
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
