import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import type { Logger, Plugin } from 'vite';
import type { OfficialPluginDef } from '../../../../../scripts/official-plugins.config.ts';
import {
	buildOfficialPluginAssets,
	type OfficialPluginBuildResult
} from '../../../../../scripts/official-plugin-build/build-plugin.ts';
import { createDevOfficialPluginBundleMiddleware } from '../../../../../scripts/official-plugin-build/dev-bundle-middleware.ts';

export type PluginHmrPayload = OfficialPluginBuildResult;

export interface ChronosPluginHmrOptions {
	monorepoRoot: string;
	plugins: OfficialPluginDef[];
	createAliasRecord: (root?: string) => Record<string, string>;
	hostVersion?: string;
}

function formatPluginHmrPath(rootDir: string, filePath: string): string {
	return relative(rootDir, filePath).replace(/\\/g, '/');
}

function logPluginHmrInfo(logger: Logger, message: string): void {
	logger.info(`(plugin) ${message}`, { timestamp: true });
}

function logPluginHmrError(logger: Logger, message: string): void {
	logger.error(`(plugin) ${message}`, { timestamp: true });
}

function resolveHostVersion(monorepoRoot: string, override?: string): string {
	if (override) return override;
	const packageJson = JSON.parse(
		readFileSync(resolve(monorepoRoot, 'apps/web/package.json'), 'utf8')
	) as { version: string };
	return packageJson.version;
}

export async function buildSingleOfficialPlugin(
	plugin: OfficialPluginDef,
	root: string,
	createAliasRecord: (root?: string) => Record<string, string>,
	releaseVersion = '0.0.0-dev',
	_logger?: Logger,
	rev?: string
): Promise<PluginHmrPayload> {
	return buildOfficialPluginAssets(plugin, {
		root,
		releaseVersion,
		createAliasRecord,
		mode: 'dev',
		rev
	});
}

export function chronosPluginHmrPlugin(options: ChronosPluginHmrOptions): Plugin {
	const { monorepoRoot, plugins, createAliasRecord, hostVersion } = options;
	const pluginBySourceDir = new Map(plugins.map((plugin) => [plugin.sourceDir, plugin]));
	const resolvedHostVersion = resolveHostVersion(monorepoRoot, hostVersion);

	return {
		name: 'chronos-plugin-hmr',
		apply: 'serve',
		configureServer(server) {
			const logger = server.config.logger;
			const pluginsDir = resolve(monorepoRoot, 'packages/plugins');
			server.watcher.add(pluginsDir);
			server.middlewares.use(createDevOfficialPluginBundleMiddleware(monorepoRoot));

			const pendingTimers = new Map<string, NodeJS.Timeout>();
			const inFlightBuilds = new Set<string>();
			const queuedRebuilds = new Set<string>();
			const triggerFiles = new Map<string, string>();

			const executeBuild = async (pluginDef: OfficialPluginDef) => {
				if (inFlightBuilds.has(pluginDef.id)) {
					queuedRebuilds.add(pluginDef.id);
					return;
				}

				inFlightBuilds.add(pluginDef.id);
				try {
					do {
						queuedRebuilds.delete(pluginDef.id);
						const startTime = performance.now();
						const triggerFile = triggerFiles.get(pluginDef.id);
						try {
							const payload = await buildSingleOfficialPlugin(
								pluginDef,
								monorepoRoot,
								createAliasRecord,
								resolvedHostVersion,
								logger
							);
							const costMs = (performance.now() - startTime).toFixed(1);
							const hmrMessage = triggerFile
								? `hmr update ${formatPluginHmrPath(server.config.root, triggerFile)} → ${pluginDef.id}@${payload.rev ?? '?'} in ${costMs}ms`
								: `hmr update ${pluginDef.id}@${payload.rev ?? '?'} in ${costMs}ms`;

							server.ws.send({
								type: 'custom',
								event: 'chronos:plugin-hmr',
								data: {
									...payload,
									costMs
								}
							});
							logPluginHmrInfo(logger, hmrMessage);
						} catch (err: unknown) {
							const error = err instanceof Error ? err : new Error(String(err));
							const triggerSuffix = triggerFile
								? ` (${formatPluginHmrPath(server.config.root, triggerFile)})`
								: '';
							logPluginHmrError(
								logger,
								`hmr error ${pluginDef.id}${triggerSuffix}: ${error.message}`
							);
							server.ws.send({
								type: 'custom',
								event: 'chronos:plugin-hmr-error',
								data: {
									id: pluginDef.id,
									message: error.message,
									stack: error.stack
								}
							});
						}
					} while (queuedRebuilds.has(pluginDef.id));
				} finally {
					inFlightBuilds.delete(pluginDef.id);
					triggerFiles.delete(pluginDef.id);
				}
			};

			const handleFileEvent = (filePath: string) => {
				const normalized = filePath.replace(/\\/g, '/');
				if (!normalized.includes('/packages/plugins/')) return;
				if (
					normalized.includes('/node_modules/') ||
					normalized.includes('/tests/') ||
					normalized.includes('.test.') ||
					normalized.includes('.spec.')
				) {
					return;
				}

				const rel = relative(pluginsDir, filePath).replace(/\\/g, '/');
				const sourceDir = rel.split('/')[0];
				if (!sourceDir) return;

				const pluginDef = pluginBySourceDir.get(sourceDir);
				if (!pluginDef) return;

				triggerFiles.set(pluginDef.id, filePath);

				const existingTimer = pendingTimers.get(pluginDef.id);
				if (existingTimer) clearTimeout(existingTimer);

				const timer = setTimeout(() => {
					pendingTimers.delete(pluginDef.id);
					void executeBuild(pluginDef);
				}, 100);

				pendingTimers.set(pluginDef.id, timer);
			};

			server.watcher.on('change', handleFileEvent);
			server.watcher.on('add', handleFileEvent);
			server.watcher.on('unlink', handleFileEvent);
		}
	};
}
