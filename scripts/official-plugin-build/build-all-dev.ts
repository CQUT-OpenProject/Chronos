import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { OfficialPluginDef } from '../official-plugins.config.ts';
import { OFFICIAL_PLUGINS } from '../official-plugins.config.ts';
import { createChronosAliasRecord } from '../resolve-chronos-aliases.ts';
import { buildOfficialPluginAssets, type OfficialPluginBuildResult } from './build-plugin.ts';

export interface BuildAllOfficialPluginsDevOptions {
	root: string;
	releaseVersion?: string;
	plugins?: OfficialPluginDef[];
	createAliasRecord?: (root?: string) => Record<string, string>;
	onBuilt?: (payload: OfficialPluginBuildResult) => void;
}

export async function buildAllOfficialPluginsDev(
	options: BuildAllOfficialPluginsDevOptions
): Promise<OfficialPluginBuildResult[]> {
	const { root } = options;
	const releaseVersion =
		options.releaseVersion ??
		(JSON.parse(readFileSync(resolve(root, 'apps/web/package.json'), 'utf8')).version as string);
	const createAliasRecord = options.createAliasRecord ?? createChronosAliasRecord;
	const plugins = options.plugins ?? OFFICIAL_PLUGINS;

	const results = await Promise.all(
		plugins.map(async (plugin) => {
			const payload = await buildOfficialPluginAssets(plugin, {
				root,
				releaseVersion,
				createAliasRecord,
				mode: 'dev'
			});
			options.onBuilt?.(payload);
			return payload;
		})
	);

	return results;
}
