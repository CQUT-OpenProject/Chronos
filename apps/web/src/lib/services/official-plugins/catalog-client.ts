import type { OfficialPluginCatalog, PluginManifest } from '@chronos/core';
import { IHttpService } from '@chronos/core';
import type { ChronosEngine } from '@chronos/core';
import { validatePluginManifest } from './plugin-bundle';

export class OfficialPluginCatalogClient {
	constructor(private readonly engine: ChronosEngine) {}

	async fetchCatalog(
		catalogUrl = '/official-plugins/catalog.json'
	): Promise<OfficialPluginCatalog> {
		const response = await this.engine.services.get(IHttpService).request(catalogUrl, {
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch official plugin catalog from ${catalogUrl}: ${response.status}`
			);
		}

		const catalog = (await response.json()) as OfficialPluginCatalog;
		if (!catalog || !Array.isArray(catalog.manifests)) {
			throw new Error('Invalid official plugin catalog schema format');
		}

		return catalog;
	}

	async fetchManifest(manifestUrl: string): Promise<PluginManifest> {
		const response = await this.engine.services.get(IHttpService).request(manifestUrl, {
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch plugin manifest from ${manifestUrl}: ${response.status}`);
		}

		const manifest = (await response.json()) as PluginManifest;
		validatePluginManifest(manifest);
		return manifest;
	}
}
