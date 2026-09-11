import { describe, expect, it, vi } from 'vite-plus/test';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDevOfficialPluginBundleMiddleware } from './dev-bundle-middleware.ts';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..');
const pluginId = 'tool-today';
const devDir = resolve(root, 'dist/dev-plugins', pluginId);

describe('createDevOfficialPluginBundleMiddleware', () => {
	it('serves dev bundle files with no-cache when present', () => {
		mkdirSync(devDir, { recursive: true });
		writeFileSync(resolve(devDir, 'bundle.js'), 'export default {}', 'utf8');

		const middleware = createDevOfficialPluginBundleMiddleware(root);
		const next = vi.fn();
		const headers: Record<string, string> = {};
		let body = '';

		const res = {
			statusCode: 0,
			setHeader(key: string, value: string) {
				headers[key.toLowerCase()] = value;
			},
			end(chunk: string) {
				this.statusCode = 200;
				body = chunk;
			}
		};

		middleware(
			{ url: `/official-plugins/bundles/${pluginId}/bundle.js` } as never,
			res as never,
			next
		);

		expect(next).not.toHaveBeenCalled();
		expect(res.statusCode).toBe(200);
		expect(body).toBe('export default {}');
		expect(headers['cache-control']).toBe('no-cache');
		expect(headers['content-type']).toContain('javascript');

		rmSync(resolve(root, 'dist/dev-plugins'), { recursive: true, force: true });
	});

	it('falls through when dev bundle is missing', () => {
		const middleware = createDevOfficialPluginBundleMiddleware(root);
		const next = vi.fn();

		middleware({ url: '/official-plugins/bundles/missing/bundle.js' } as never, {} as never, next);

		expect(next).toHaveBeenCalledTimes(1);
	});
});
