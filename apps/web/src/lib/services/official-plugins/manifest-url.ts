import type { PluginManifest } from '@chronos/core';

const MANIFEST_ASSET_URL_FIELDS: ReadonlyArray<
	readonly [keyof PluginManifest, keyof PluginManifest]
> = [
	['bundleUrl', 'bundleUrl'],
	['cssUrl', 'cssUrl'],
	['colorsUrl', 'colorsUrl'],
	['iconThemeUrl', 'iconThemeUrl']
];

/** Validates a manifest install URL (http/https with non-empty hostname). */
export function assertValidManifestInstallUrl(url: string): void {
	const trimmed = url.trim();
	if (!trimmed) {
		throw new Error('Manifest URL is required');
	}

	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		throw new Error('Invalid manifest URL');
	}

	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		throw new Error('Manifest URL must use http or https');
	}

	if (!parsed.hostname) {
		throw new Error('Manifest URL must have a hostname');
	}
}

/**
 * Returns the install source origin for display (e.g. "https://example.com"),
 * or null when the URL is not a valid manifest install URL.
 */
export function describeInstallSource(url: string): string | null {
	try {
		assertValidManifestInstallUrl(url);
		return new URL(url.trim()).origin;
	} catch {
		return null;
	}
}

function resolveManifestBase(manifestUrl: string): URL {
	try {
		return new URL(manifestUrl);
	} catch {
		if (manifestUrl.startsWith('/')) {
			const origin =
				typeof window !== 'undefined' && window.location?.origin
					? window.location.origin
					: 'http://localhost';
			return new URL(manifestUrl, origin);
		}
		throw new Error(`Invalid manifest URL: ${manifestUrl}`);
	}
}

/**
 * Resolves a manifest asset URL against the manifest URL base.
 * - Absolute http(s) URLs are returned as-is.
 * - Root-relative paths resolve against the manifest origin.
 * - Other relative paths resolve against the manifest directory.
 */
export function resolveManifestAssetUrl(manifestUrl: string, assetUrl: string): string {
	if (/^https?:\/\//i.test(assetUrl)) {
		return assetUrl;
	}

	const manifestBase = resolveManifestBase(manifestUrl);
	if (assetUrl.startsWith('/')) {
		return new URL(assetUrl, manifestBase.origin).href;
	}
	return new URL(assetUrl, manifestBase.href).href;
}

/** Resolves downloadable asset URLs in a manifest copy when manifestUrl is provided. */
export function resolveManifestForDownload(
	manifest: PluginManifest,
	manifestUrl?: string
): PluginManifest {
	if (!manifestUrl) return manifest;

	const resolved = { ...manifest };
	for (const [field] of MANIFEST_ASSET_URL_FIELDS) {
		const value = manifest[field];
		if (typeof value === 'string' && value.length > 0) {
			(resolved as Record<string, unknown>)[field] = resolveManifestAssetUrl(manifestUrl, value);
		}
	}
	return resolved;
}
