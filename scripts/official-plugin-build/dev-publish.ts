import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { OfficialPluginDef } from '../official-plugins.config.ts';
import { OFFICIAL_PLUGIN_BUNDLE_CSS, OFFICIAL_PLUGIN_BUNDLE_JS } from './compile-entry.ts';
import { buildDevManifestForPlugin, writeDevPluginManifest } from './build-manifest.ts';
import { createOfficialPluginBuildPaths, type OfficialPluginBuildPaths } from './paths.ts';

export interface DevPluginBuildFiles {
	code: string | null;
	cssCode: string | null;
	colorsJson: string | null;
	iconThemeJson: string | null;
}

export interface PublishDevPluginBuildOptions {
	plugin: OfficialPluginDef;
	rev: string;
	files: DevPluginBuildFiles;
	releaseVersion: string;
	root?: string;
	paths?: OfficialPluginBuildPaths;
}

export interface PublishDevPluginBuildResult {
	rev: string;
	manifest: Record<string, unknown>;
}

function writeDevAssetFiles(dir: string, files: DevPluginBuildFiles): void {
	mkdirSync(dir, { recursive: true });

	if (files.code) {
		writeFileSync(resolve(dir, OFFICIAL_PLUGIN_BUNDLE_JS), files.code, 'utf8');
	}
	if (files.cssCode) {
		writeFileSync(resolve(dir, OFFICIAL_PLUGIN_BUNDLE_CSS), files.cssCode, 'utf8');
	}
	if (files.colorsJson) {
		writeFileSync(resolve(dir, 'colors.json'), files.colorsJson, 'utf8');
	}
	if (files.iconThemeJson) {
		writeFileSync(resolve(dir, 'icons.json'), files.iconThemeJson, 'utf8');
	}
}

export function publishDevPluginBuild(
	options: PublishDevPluginBuildOptions
): PublishDevPluginBuildResult {
	const { plugin, rev, files, releaseVersion } = options;
	const paths = options.paths ?? createOfficialPluginBuildPaths(options.root ?? process.cwd());
	const pluginDir = paths.devOutDir(plugin.id);
	const tempDir = paths.devTempDir(plugin.id);
	const revDir = paths.devRevDir(plugin.id, rev);

	rmSync(tempDir, { recursive: true, force: true });
	writeDevAssetFiles(tempDir, files);

	const manifest = buildDevManifestForPlugin(plugin, files, releaseVersion, rev);
	writeFileSync(
		resolve(tempDir, 'manifest.json'),
		`${JSON.stringify(manifest, null, '\t')}\n`,
		'utf8'
	);

	mkdirSync(pluginDir, { recursive: true });
	if (existsSync(revDir)) {
		rmSync(revDir, { recursive: true, force: true });
	}
	renameSync(tempDir, revDir);
	writeDevPluginManifest(paths.devManifestPath(plugin.id), manifest);

	return { rev, manifest };
}

export function readPublishedDevManifest(
	pluginId: string,
	root?: string
): Record<string, unknown> | null {
	const paths = createOfficialPluginBuildPaths(root ?? process.cwd());
	const manifestPath = paths.devManifestPath(pluginId);
	if (!existsSync(manifestPath)) return null;
	return JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
}
