import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Connect } from 'vite';
import { createOfficialPluginBuildPaths } from './paths.ts';

const DEV_BUNDLE_WITH_REV_PATH =
	/^\/official-plugins\/bundles\/([^/]+)\/([^/]+)\/(bundle\.js|bundle\.css|colors\.json|icons\.json)$/;

export function createDevOfficialPluginBundleMiddleware(
	monorepoRoot: string
): Connect.NextHandleFunction {
	const paths = createOfficialPluginBuildPaths(monorepoRoot);

	return (req, res, next) => {
		const url = req.url?.split('?')[0] ?? '';
		const match = DEV_BUNDLE_WITH_REV_PATH.exec(url);
		if (!match) {
			next();
			return;
		}

		const [, pluginId, rev, fileName] = match;
		const filePath = resolve(paths.devRevDir(pluginId, rev), fileName);
		if (!existsSync(filePath)) {
			res.statusCode = 404;
			res.end('Not Found');
			return;
		}

		const content = readFileSync(filePath, 'utf8');
		const contentType = fileName.endsWith('.css')
			? 'text/css; charset=utf-8'
			: fileName.endsWith('.js')
				? 'text/javascript; charset=utf-8'
				: 'application/json; charset=utf-8';

		res.statusCode = 200;
		res.setHeader('Content-Type', contentType);
		res.setHeader('Cache-Control', 'no-cache');
		res.end(content);
	};
}
