import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { OfficialPluginDef } from '../official-plugins.config.ts';
import { OFFICIAL_PLUGIN_BUNDLE_CSS, OFFICIAL_PLUGIN_BUNDLE_JS } from './compile-entry.ts';
import { readPublishedDevManifest } from './dev-publish.ts';
import type { OfficialPluginBuildResult } from './build-plugin.ts';
import { createOfficialPluginBuildPaths } from './paths.ts';

function readOptionalUtf8(path: string): string | null {
	if (!existsSync(path)) return null;
	return readFileSync(path, 'utf8');
}

export function loadDevPluginBuildPayload(
	plugin: OfficialPluginDef,
	root: string
): OfficialPluginBuildResult | null {
	const manifest = readPublishedDevManifest(plugin.id, root);
	const devRev = manifest?.devRev;
	if (typeof devRev !== 'string' || !devRev) return null;

	const paths = createOfficialPluginBuildPaths(root);
	const revDir = paths.devRevDir(plugin.id, devRev);

	return {
		id: plugin.id,
		type: plugin.type,
		rev: devRev,
		manifest: manifest ?? undefined,
		code: readOptionalUtf8(resolve(revDir, OFFICIAL_PLUGIN_BUNDLE_JS)),
		cssCode: readOptionalUtf8(resolve(revDir, OFFICIAL_PLUGIN_BUNDLE_CSS)),
		colorsJson: readOptionalUtf8(resolve(revDir, 'colors.json')),
		iconThemeJson: readOptionalUtf8(resolve(revDir, 'icons.json'))
	};
}
