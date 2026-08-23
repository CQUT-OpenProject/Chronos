import type { PluginManifest } from '@chronos/core';
import { IHttpService, IRuntimeService } from '@chronos/core';
import type { ChronosEngine } from '@chronos/core';
import type { OfficialPluginAssets } from './official-plugin-types';

export class OfficialPluginAssetPipeline {
	constructor(private readonly engine: ChronosEngine) {}

	async download(manifest: PluginManifest): Promise<OfficialPluginAssets> {
		let code: string | null = null;
		let colorsJson: string | null = null;
		let iconThemeJson: string | null = null;
		let cssCode: string | null = null;

		if (manifest.colorsUrl) {
			colorsJson = await this.downloadTextAsset(
				manifest.colorsUrl,
				manifest.colorsSha256,
				'colors'
			);
		}

		if (manifest.iconThemeUrl) {
			iconThemeJson = await this.downloadTextAsset(
				manifest.iconThemeUrl,
				manifest.iconThemeSha256,
				'icon theme'
			);
		}

		if (manifest.bundleUrl) {
			code = await this.downloadTextAsset(manifest.bundleUrl, manifest.sha256, 'bundle');
			const cssUrl = manifest.cssUrl;
			const cssSha256 = manifest.cssSha256;
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
		const response = await this.engine.services.get(IHttpService).request(url, {
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
