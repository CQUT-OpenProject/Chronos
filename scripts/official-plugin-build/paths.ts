import { resolve } from 'node:path';

export interface OfficialPluginBuildPaths {
	root: string;
	compileDistDir: string;
	staticBundleDir: string;
	manifestDir: string;
	catalogPath: string;
	devPluginsRoot: string;
	devOutDir: (pluginId: string) => string;
	devRevDir: (pluginId: string, rev: string) => string;
	devTempDir: (pluginId: string) => string;
	devManifestPath: (pluginId: string) => string;
	pluginBundleDir: (pluginId: string) => string;
}

export function createOfficialPluginBuildPaths(
	root: string,
	options?: { devPluginsRoot?: string }
): OfficialPluginBuildPaths {
	const staticBundleDir = resolve(root, 'apps/web/static/official-plugins/bundles');
	const manifestDir = resolve(root, 'apps/web/static/official-plugins/manifests');
	const devPluginsRoot = options?.devPluginsRoot ?? resolve(root, 'dist/dev-plugins');

	return {
		root,
		compileDistDir: resolve(root, 'dist/official-plugins'),
		staticBundleDir,
		manifestDir,
		catalogPath: resolve(root, 'apps/web/static/official-plugins/catalog.json'),
		devPluginsRoot,
		devOutDir: (pluginId) => resolve(devPluginsRoot, pluginId),
		devRevDir: (pluginId, rev) => resolve(devPluginsRoot, pluginId, rev),
		devTempDir: (pluginId) => resolve(devPluginsRoot, pluginId, '.building'),
		devManifestPath: (pluginId) => resolve(devPluginsRoot, pluginId, 'manifest.json'),
		pluginBundleDir: (pluginId) => resolve(staticBundleDir, pluginId)
	};
}
