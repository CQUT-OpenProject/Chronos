import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { OfficialPluginDef } from '../official-plugins.config.ts';
import {
	compileOfficialPluginEntry,
	OFFICIAL_PLUGIN_BUNDLE_CSS,
	OFFICIAL_PLUGIN_BUNDLE_JS
} from './compile-entry.ts';
import { createOfficialPluginBuildPaths } from './paths.ts';

export type OfficialPluginBuildMode = 'production' | 'dev';

export interface BuildOfficialPluginOptions {
	root: string;
	releaseVersion: string;
	createAliasRecord: (root?: string) => Record<string, string>;
	mode: OfficialPluginBuildMode;
}

export interface OfficialPluginBuildResult {
	id: string;
	type: 'theme' | 'tool';
	code: string | null;
	cssCode: string | null;
	colorsJson: string | null;
	iconThemeJson: string | null;
}

export async function buildOfficialPluginAssets(
	plugin: OfficialPluginDef,
	options: BuildOfficialPluginOptions
): Promise<OfficialPluginBuildResult> {
	const { root, releaseVersion, createAliasRecord, mode } = options;
	const paths = createOfficialPluginBuildPaths(root);
	const outDir = mode === 'dev' ? paths.devOutDir(plugin.id) : paths.pluginBundleDir(plugin.id);

	mkdirSync(outDir, { recursive: true });

	let code: string | null = null;
	let cssCode: string | null = null;
	let colorsJson: string | null = null;
	let iconThemeJson: string | null = null;

	if (plugin.colorsJson && existsSync(plugin.colorsJson)) {
		colorsJson = readFileSync(plugin.colorsJson, 'utf8');
		writeFileSync(resolve(outDir, 'colors.json'), colorsJson, 'utf8');
	}

	if (plugin.iconsJson && existsSync(plugin.iconsJson)) {
		iconThemeJson = readFileSync(plugin.iconsJson, 'utf8');
		writeFileSync(resolve(outDir, 'icons.json'), iconThemeJson, 'utf8');
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
		} else {
			if (code) {
				writeFileSync(resolve(outDir, OFFICIAL_PLUGIN_BUNDLE_JS), code, 'utf8');
			}
			if (cssCode) {
				writeFileSync(resolve(outDir, OFFICIAL_PLUGIN_BUNDLE_CSS), cssCode, 'utf8');
			} else {
				const devCssPath = resolve(outDir, OFFICIAL_PLUGIN_BUNDLE_CSS);
				if (existsSync(devCssPath)) {
					rmSync(devCssPath, { force: true });
				}
			}
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
