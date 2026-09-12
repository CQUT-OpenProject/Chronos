import { describe, expect, it, vi, afterEach } from 'vite-plus/test';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createDevOfficialPluginBundleMiddleware } from './dev-bundle-middleware.ts';

const pluginId = 'tool-today';

describe('createDevOfficialPluginBundleMiddleware', () => {
	let tempRoot = '';

	afterEach(() => {
		if (tempRoot) {
			rmSync(tempRoot, { recursive: true, force: true });
			tempRoot = '';
		}
	});

	it('serves rev-scoped dev bundle files with no-cache when present', () => {
		tempRoot = mkdtempSync(resolve(tmpdir(), 'chronos-dev-mw-'));
		const rev = 'rev1';
		const devDir = resolve(tempRoot, 'dist/dev-plugins', pluginId, rev);
		mkdirSync(devDir, { recursive: true });
		writeFileSync(resolve(devDir, 'bundle.js'), 'export default {}', 'utf8');

		const middleware = createDevOfficialPluginBundleMiddleware(tempRoot);
		const next = vi.fn();
		const headers: Record<string, string> = {};
		let body = '';
		let statusCode = 0;

		const res = {
			statusCode: 0,
			setHeader(key: string, value: string) {
				headers[key.toLowerCase()] = value;
			},
			end(chunk: string) {
				statusCode = 200;
				body = chunk;
			}
		};

		middleware(
			{ url: `/official-plugins/bundles/${pluginId}/${rev}/bundle.js` } as never,
			res as never,
			next
		);

		expect(next).not.toHaveBeenCalled();
		expect(statusCode).toBe(200);
		expect(body).toBe('export default {}');
		expect(headers['cache-control']).toBe('no-cache');
		expect(headers['content-type']).toContain('javascript');
	});

	it('returns 404 when the requested rev is missing', () => {
		tempRoot = mkdtempSync(resolve(tmpdir(), 'chronos-dev-mw-'));
		const middleware = createDevOfficialPluginBundleMiddleware(tempRoot);
		const next = vi.fn();
		let statusCode = 0;

		const res = {
			statusCode: 0,
			setHeader: vi.fn(),
			end: vi.fn(() => {
				statusCode = 404;
			})
		};

		middleware(
			{ url: `/official-plugins/bundles/${pluginId}/missing-rev/bundle.js` } as never,
			res as never,
			next
		);

		expect(next).not.toHaveBeenCalled();
		expect(statusCode).toBe(404);
	});

	it('falls through for production bundle URLs without rev', () => {
		tempRoot = mkdtempSync(resolve(tmpdir(), 'chronos-dev-mw-'));
		const middleware = createDevOfficialPluginBundleMiddleware(tempRoot);
		const next = vi.fn();

		middleware(
			{ url: `/official-plugins/bundles/${pluginId}/bundle.js` } as never,
			{} as never,
			next
		);

		expect(next).toHaveBeenCalledTimes(1);
	});
});
