import type { ConfigSchema } from '../schema/schema';

export type PluginCapability = 'network' | 'storage' | 'vault' | 'notifications';
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
	capabilities?: PluginCapability[]; // Requested capabilities (legacy alias for permissions)
	permissions?: PluginCapability[]; // Requested permissions
	allowedDomains?: string[]; // Allowed network domain whitelist
	configSchema?: ConfigSchema<Record<string, unknown>>;
	icon?: string;
	homepage?: string;
}

export interface MarketplaceRegistry {
	version: number;
	updatedAt: number;
	plugins: PluginManifest[];
}

// ── Runtime bundle loader ────────────────────────────────────────────

/** A successfully fetched and verified plugin bundle ready for execution. */
export interface LoadedBundle {
	readonly pluginId: string;
	readonly code: string;
	readonly manifest: PluginManifest;
	readonly loadedAt: number;
}

/**
 * Runtime loader responsible for fetching plugin bundles from a
 * marketplace registry, verifying integrity (sha256 / Ed25519 signature),
 * and managing a local bundle cache.
 */
export interface MarketplaceLoader {
	/** Fetch the remote plugin registry index. */
	fetchRegistry(url: string): Promise<MarketplaceRegistry>;

	/** Download, verify, and return a ready-to-execute bundle. */
	loadBundle(manifest: PluginManifest): Promise<LoadedBundle>;

	/** Verify bundle integrity against the manifest's sha256 and optional signature. */
	verifyIntegrity(manifest: PluginManifest, code: ArrayBuffer): Promise<boolean>;

	/** Retrieve a previously cached bundle, or `null` if not cached. */
	getCachedBundle(pluginId: string): Promise<LoadedBundle | null>;

	/** Clear cached bundles. Pass `pluginId` to clear a single entry, omit to clear all. */
	clearCache(pluginId?: string): Promise<void>;
}
