import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import type { Plugin, ResolvedConfig } from 'vite';

export interface OfficialPluginsPluginOptions {
	catalogPath?: string;
	buildCommand?: (reason: string) => void;
	isBuild: boolean;
	isTest?: boolean;
}

export function defaultBuildOfficialPlugins(
	monorepoRoot: string,
	scriptPath: string,
	reason: string
): void {
	console.log(`[chronos-official-plugins] ${reason}, building official plugins...`);
	const result = spawnSync(process.execPath, ['--experimental-strip-types', scriptPath], {
		cwd: monorepoRoot,
		stdio: 'inherit'
	});
	if (result.status !== 0) {
		throw new Error(`Failed to build official plugins: exit code ${result.status}`);
	}
}

function ensureCatalogBuilt(
	catalogPath: string | undefined,
	buildCommand: ((reason: string) => void) | undefined,
	reason: string
): void {
	if (catalogPath && !existsSync(catalogPath)) {
		buildCommand?.(reason);
	}
}

export function createOfficialPluginsPlugin(options: OfficialPluginsPluginOptions): Plugin {
	const { catalogPath, buildCommand, isBuild, isTest = Boolean(process.env.VITEST) } = options;
	let resolvedConfig: ResolvedConfig | null = null;

	return {
		name: 'chronos-official-plugins',
		configureServer() {
			ensureCatalogBuilt(catalogPath, buildCommand, 'catalog.json missing');
		},
		configResolved(config) {
			resolvedConfig = config;
		},
		buildStart() {
			if (isTest) {
				ensureCatalogBuilt(catalogPath, buildCommand, 'catalog.json missing');
				return;
			}
			if (!isBuild) {
				ensureCatalogBuilt(catalogPath, buildCommand, 'catalog.json missing');
				return;
			}
			if (!resolvedConfig?.build.ssr) {
				return;
			}
			buildCommand?.('production build');
		}
	};
}
