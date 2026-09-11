import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { OfficialPluginDef } from '../official-plugins.config.ts';
import { pluginAssetUrl } from './urls.ts';

export interface OfficialPluginAssetPayload {
	code: string | null;
	cssCode: string | null;
	colorsJson: string | null;
	iconThemeJson: string | null;
}

export function buildManifestForPlugin(
	plugin: OfficialPluginDef,
	assets: OfficialPluginAssetPayload,
	releaseVersion: string
): Record<string, unknown> {
	const manifest: Record<string, unknown> = {
		id: plugin.id,
		name: plugin.name,
		version: releaseVersion,
		description: plugin.description,
		author: 'Chronos',
		type: plugin.type,
		bundleFormat: 'esm'
	};

	if (assets.colorsJson) {
		manifest.colorsUrl = pluginAssetUrl(plugin.id, 'colors.json');
		manifest.colorsSha256 = createHash('sha256').update(assets.colorsJson).digest('hex');
		const declaredId = (JSON.parse(assets.colorsJson) as { id?: unknown }).id;
		if (typeof declaredId === 'string' && declaredId) {
			manifest.themeId = declaredId;
		}
	}

	if (assets.iconThemeJson) {
		manifest.iconThemeUrl = pluginAssetUrl(plugin.id, 'icons.json');
		manifest.iconThemeSha256 = createHash('sha256').update(assets.iconThemeJson).digest('hex');
	}

	if (assets.code) {
		manifest.bundleUrl = pluginAssetUrl(plugin.id, 'bundle.js');
		manifest.sha256 = createHash('sha256').update(assets.code).digest('hex');
	}

	if (assets.cssCode) {
		manifest.cssUrl = pluginAssetUrl(plugin.id, 'bundle.css');
		manifest.cssSha256 = createHash('sha256').update(assets.cssCode).digest('hex');
	}

	return manifest;
}

export function writePluginManifest(
	manifestDir: string,
	pluginId: string,
	manifest: Record<string, unknown>
): void {
	writeFileSync(
		resolve(manifestDir, `${pluginId}.manifest.json`),
		`${JSON.stringify(manifest, null, '\t')}\n`,
		'utf8'
	);
}
