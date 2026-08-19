export type PluginCapability = 'network' | 'storage' | 'notifications';
export type BundleFormat = 'iife' | 'esm';

export interface PluginManifest {
	id: string;
	name: Record<string, string>; // Multi-locale name: { "zh-CN": "...", "en": "..." }
	version: string;
	description: Record<string, string>;
	author: string;
	type: 'theme' | 'source' | 'tool' | 'exporter';
	bundleFormat: BundleFormat;
	minEngineVersion: string;
	bundleUrl: string; // CDN bundle URL
	sha256: string; // Integrity verification hash
	signature?: string; // Ed25519 signature (unsigned plugins run in Worker sandbox)
	capabilities?: PluginCapability[]; // Requested capabilities
}

export interface MarketplaceRegistry {
	version: number;
	updatedAt: number;
	plugins: PluginManifest[];
}
