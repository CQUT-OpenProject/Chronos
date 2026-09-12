import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { OfficialPluginDef } from '../official-plugins.config.ts';
import {
	compileOfficialPluginEntry,
	OFFICIAL_PLUGIN_BUNDLE_CSS,
	OFFICIAL_PLUGIN_BUNDLE_JS
} from './compile-entry.ts';
import { publishDevPluginBuild } from './dev-publish.ts';
import { createOfficialPluginBuildPaths } from './paths.ts';

export type OfficialPluginBuildMode = 'production' | 'dev';

export interface BuildOfficialPluginOptions {
	root: string;
	releaseVersion: string;
	createAliasRecord: (root?: string) => Record<string, string>;
	mode: OfficialPluginBuildMode;
	rev?: string;
}

export interface OfficialPluginBuildResult {
	id: string;
	type: 'theme' | 'tool';
	rev?: string;
	manifest?: Record<string, unknown>;
	code: string | null;
	cssCode: string | null;
	colorsJson: string | null;
	iconThemeJson: string | null;
}

function createDevRevision(): string {
	return Date.now().toString(36);
}

export async function buildOfficialPluginAssets(
	plugin: OfficialPluginDef,
	options: BuildOfficialPluginOptions
): Promise<OfficialPluginBuildResult> {
	const { root, releaseVersion, createAliasRecord, mode } = options;
	const paths = createOfficialPluginBuildPaths(root);
	const outDir = mode === 'dev' ? paths.devTempDir(plugin.id) : paths.pluginBundleDir(plugin.id);

	if (mode === 'dev') {
		rmSync(outDir, { recursive: true, force: true });
	}
	mkdirSync(outDir, { recursive: true });

	let code: string | null = null;
	let cssCode: string | null = null;
	let colorsJson: string | null = null;
	let iconThemeJson: string | null = null;

	if (plugin.colorsJson && existsSync(plugin.colorsJson)) {
		colorsJson = readFileSync(plugin.colorsJson, 'utf8');
		if (mode === 'production') {
			writeFileSync(resolve(outDir, 'colors.json'), colorsJson, 'utf8');
		}
	}

	if (plugin.iconsJson && existsSync(plugin.iconsJson)) {
		iconThemeJson = readFileSync(plugin.iconsJson, 'utf8');
		if (mode === 'production') {
			writeFileSync(resolve(outDir, 'icons.json'), iconThemeJson, 'utf8');
		}
	}

	if (plugin.entry && existsSync(plugin.entry)) {
		const compileOutDir = mode === 'dev' ? outDir : resolve(paths.compileDistDir, plugin.id);
		const compiled = await compileOfficialPluginEntry(
			plugin,
			root,
			createAliasRecord,
			compileOutDir,
			releaseVersion
		);
		code = compiled.code;
		cssCode = compiled.cssCode;

		if (mode === 'production') {
			if (!code) {
				throw new Error(`${plugin.id}: official plugin entry produced no bundle.js`);
			}
			writeFileSync(resolve(outDir, OFFICIAL_PLUGIN_BUNDLE_JS), code, 'utf8');
			const staticCssPath = resolve(outDir, OFFICIAL_PLUGIN_BUNDLE_CSS);
			if (cssCode) {
				writeFileSync(staticCssPath, cssCode, 'utf8');
			} else if (existsSync(staticCssPath)) {
				rmSync(staticCssPath, { force: true });
			}
		}
	}

	if (mode === 'dev') {
		const rev = options.rev ?? createDevRevision();
		try {
			const published = publishDevPluginBuild({
				plugin,
				rev,
				files: { code, cssCode, colorsJson, iconThemeJson },
				releaseVersion,
				paths
			});
			return {
				id: plugin.id,
				type: plugin.type,
				rev: published.rev,
				manifest: published.manifest,
				code,
				cssCode,
				colorsJson,
				iconThemeJson
			};
		} catch (error) {
			rmSync(outDir, { recursive: true, force: true });
			throw error;
		}
	}

	return {
		id: plugin.id,
		type: plugin.type,
		code,
		cssCode,
		colorsJson,
		iconThemeJson
	};
}
