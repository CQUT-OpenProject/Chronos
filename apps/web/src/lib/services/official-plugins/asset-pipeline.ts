import type { PluginManifest } from '@chronos/core';
import type { ChronosEngine } from '@chronos/core';
import type { OfficialPluginAssets } from './official-plugin-types';
import { resolveManifestForDownload } from './manifest-url';

export interface AssetDownloadOptions {
	signal?: AbortSignal;
	onProgress?: (progress: {
		stage: 'downloading' | 'verifying';
		percent: number;
		label?: string;
	}) => void;
}

export class OfficialPluginAssetPipeline {
	constructor(private readonly engine: ChronosEngine) {}

	async download(
		manifest: PluginManifest,
		manifestUrl?: string,
		options?: AssetDownloadOptions
	): Promise<OfficialPluginAssets> {
		const resolvedManifest = resolveManifestForDownload(manifest, manifestUrl);
		let code: string | null = null;
		let colorsJson: string | null = null;
		let iconThemeJson: string | null = null;
		let cssCode: string | null = null;

		const tasks: Array<{
			url: string;
			sha256?: string;
			label: string;
			assign: (val: string) => void;
		}> = [];

		if (resolvedManifest.colorsUrl) {
			tasks.push({
				url: resolvedManifest.colorsUrl,
				sha256: resolvedManifest.colorsSha256,
				label: 'colors',
				assign: (val) => (colorsJson = val)
			});
		}

		if (resolvedManifest.iconThemeUrl) {
			tasks.push({
				url: resolvedManifest.iconThemeUrl,
				sha256: resolvedManifest.iconThemeSha256,
				label: 'icon theme',
				assign: (val) => (iconThemeJson = val)
			});
		}

		if (resolvedManifest.bundleUrl) {
			tasks.push({
				url: resolvedManifest.bundleUrl,
				sha256: resolvedManifest.sha256,
				label: 'bundle',
				assign: (val) => (code = val)
			});
			if (resolvedManifest.cssUrl) {
				tasks.push({
					url: resolvedManifest.cssUrl,
					sha256: resolvedManifest.cssSha256,
					label: 'css',
					assign: (val) => (cssCode = val)
				});
			}
		}

		const total = tasks.length || 1;
		for (let i = 0; i < tasks.length; i++) {
			options?.signal?.throwIfAborted?.();
			const task = tasks[i]!;
			const downloadPercent = Math.round((i / total) * 70);
			options?.onProgress?.({
				stage: 'downloading',
				percent: downloadPercent,
				label: task.label
			});

			const text = await this.downloadTextAsset(
				task.url,
				task.sha256,
				task.label,
				options?.signal,
				(verifyPercent) => {
					options?.onProgress?.({
						stage: 'verifying',
						percent: Math.round(70 + (i / total) * 15 + (verifyPercent / 100) * (15 / total)),
						label: task.label
					});
				}
			);

			task.assign(text);
		}

		options?.signal?.throwIfAborted?.();
		options?.onProgress?.({
			stage: 'verifying',
			percent: 85
		});

		return { code, colorsJson, iconThemeJson, cssCode };
	}

	private async downloadTextAsset(
		url: string,
		expectedSha256: string | undefined,
		label = 'asset',
		signal?: AbortSignal,
		onVerifyProgress?: (percent: number) => void
	): Promise<string> {
		const requestUrl = withIntegrityBust(url, expectedSha256);
		try {
			return await this.fetchVerifiedText(
				requestUrl,
				url,
				expectedSha256,
				label,
				signal,
				onVerifyProgress
			);
		} catch (err) {
			if (!isIntegrityMismatch(err) || requestUrl === url) throw err;
			// Stale SW/runtime cache served old bytes (e.g. slow-network fallback):
			// the busted key already differs per content version, retry once.
			return await this.fetchVerifiedText(
				requestUrl,
				url,
				expectedSha256,
				label,
				signal,
				onVerifyProgress
			);
		}
	}

	private async fetchVerifiedText(
		requestUrl: string,
		url: string,
		expectedSha256: string | undefined,
		label: string,
		signal?: AbortSignal,
		onVerifyProgress?: (percent: number) => void
	): Promise<string> {
		signal?.throwIfAborted?.();
		const response = await this.engine.http.request(requestUrl, {
			method: 'GET',
			signal
		});
		if (!response.ok) {
			throw new Error(`Failed to download plugin ${label} from ${url}`);
		}
		const text = await response.text();
		signal?.throwIfAborted?.();
		if (expectedSha256) {
			onVerifyProgress?.(50);
			const hash = await this.engine.runtime.sha256(text);
			signal?.throwIfAborted?.();
			if (hash.toLowerCase() !== expectedSha256.toLowerCase()) {
				throw new Error(
					`Plugin ${label} integrity check failed. Expected ${expectedSha256}, got ${hash}`
				);
			}
			onVerifyProgress?.(100);
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
