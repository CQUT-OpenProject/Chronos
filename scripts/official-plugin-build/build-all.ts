import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createChronosAliasRecord } from '../resolve-chronos-aliases.ts';
import { verifyOfficialPlugins } from '../verify-official-plugins.ts';
import { OFFICIAL_PLUGINS } from '../official-plugins.config.ts';
import { buildManifestForPlugin, writePluginManifest } from './build-manifest.ts';
import { buildOfficialPluginAssets } from './build-plugin.ts';
import { createOfficialPluginBuildPaths } from './paths.ts';
export interface BuildAllOfficialPluginsOptions {
	root: string;
	releaseVersion?: string;
}

export async function buildAllOfficialPlugins(
	options: BuildAllOfficialPluginsOptions
): Promise<void> {
	const { root } = options;
	const releaseVersion =
		options.releaseVersion ??
		(JSON.parse(readFileSync(resolve(root, 'apps/web/package.json'), 'utf8')).version as string);

	const paths = createOfficialPluginBuildPaths(root);

	mkdirSync(paths.compileDistDir, { recursive: true });
	mkdirSync(paths.staticBundleDir, { recursive: true });
	mkdirSync(paths.manifestDir, { recursive: true });

	for (const f of readdirSync(paths.compileDistDir)) {
		if (f.endsWith('.bundle.js') || f.endsWith('.bundle.css') || f === 'style.css') {
			try {
				rmSync(resolve(paths.compileDistDir, f), { force: true });
			} catch {}
		}
	}

	for (const plugin of OFFICIAL_PLUGINS) {
		const assets = await buildOfficialPluginAssets(plugin, {
			root,
			releaseVersion,
			createAliasRecord: createChronosAliasRecord,
			mode: 'production'
		});

		const manifest = buildManifestForPlugin(plugin, assets, releaseVersion);
		writePluginManifest(paths.manifestDir, plugin.id, manifest);
		console.log(`${plugin.id}: manifest updated`);
	}

	const catalog = {
		version: 2,
		updatedAt: Number(process.env.SOURCE_DATE_EPOCH ?? Date.now()),
		manifests: OFFICIAL_PLUGINS.map((p) => `/official-plugins/manifests/${p.id}.manifest.json`)
	};

	writeFileSync(paths.catalogPath, `${JSON.stringify(catalog, null, '\t')}\n`, 'utf8');

	verifyOfficialPlugins();
	console.log('Official plugin bundles and manifests updated.');
}
