import type { PluginManifest } from '@chronos/core';
import { IHttpService, IRuntimeService } from '@chronos/core';
import type { ChronosEngine } from '@chronos/core';
import type { OfficialPluginAssets } from './official-plugin-types';
import { resolveManifestForDownload } from './manifest-url';

export class OfficialPluginAssetPipeline {
	constructor(private readonly engine: ChronosEngine) {}

	async download(manifest: PluginManifest, manifestUrl?: string): Promise<OfficialPluginAssets> {
		const resolvedManifest = resolveManifestForDownload(manifest, manifestUrl);
		let code: string | null = null;
		let colorsJson: string | null = null;
		let iconThemeJson: string | null = null;
		let cssCode: string | null = null;

		if (resolvedManifest.colorsUrl) {
			colorsJson = await this.downloadTextAsset(
				resolvedManifest.colorsUrl,
				resolvedManifest.colorsSha256,
				'colors'
			);
		}

		if (resolvedManifest.iconThemeUrl) {
			iconThemeJson = await this.downloadTextAsset(
				resolvedManifest.iconThemeUrl,
				resolvedManifest.iconThemeSha256,
				'icon theme'
			);
		}

		if (resolvedManifest.bundleUrl) {
			code = await this.downloadTextAsset(
				resolvedManifest.bundleUrl,
				resolvedManifest.sha256,
				'bundle'
			);
			const cssUrl = resolvedManifest.cssUrl;
			const cssSha256 = resolvedManifest.cssSha256;
			if (cssUrl) {
				cssCode = await this.downloadTextAsset(cssUrl, cssSha256, 'css');
			}
		}

		return { code, colorsJson, iconThemeJson, cssCode };
	}

	private async downloadTextAsset(
		url: string,
		expectedSha256: string | undefined,
		label = 'asset'
	): Promise<string> {
		const requestUrl = withIntegrityBust(url, expectedSha256);
		try {
			return await this.fetchVerifiedText(requestUrl, url, expectedSha256, label);
		} catch (err) {
			if (!isIntegrityMismatch(err) || requestUrl === url) throw err;
			// Stale SW/runtime cache served old bytes (e.g. slow-network fallback):
			// the busted key already differs per content version, retry once.
			return await this.fetchVerifiedText(requestUrl, url, expectedSha256, label);
		}
	}

	private async fetchVerifiedText(
		requestUrl: string,
		url: string,
		expectedSha256: string | undefined,
		label: string
	): Promise<string> {
		const response = await this.engine.services.get(IHttpService).request(requestUrl, {
			method: 'GET'
		});
		if (!response.ok) {
			throw new Error(`Failed to download plugin ${label} from ${url}`);
		}
		const text = await response.text();
		if (expectedSha256) {
			const hash = await this.engine.services.get(IRuntimeService).sha256(text);
			if (hash.toLowerCase() !== expectedSha256.toLowerCase()) {
				throw new Error(
					`Plugin ${label} integrity check failed. Expected ${expectedSha256}, got ${hash}`
				);
			}
		}
		return text;
	}
}

/**
 * Appends a content-hash query so each asset version is a distinct cache key.
 * Plugin bundle URLs are stable across releases; without this a stale
 * ServiceWorker/middleware cache can pin old bytes under the new sha.
 */
function withIntegrityBust(url: string, sha256: string | undefined): string {
	if (!sha256) return url;
	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}v=${encodeURIComponent(sha256.slice(0, 16))}`;
}

function isIntegrityMismatch(err: unknown): boolean {
	return err instanceof Error && /integrity check failed/.test(err.message);
}
