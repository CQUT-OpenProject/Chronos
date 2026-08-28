import { describe, expect, it, vi, beforeEach, type Mock } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import type {
	ChronosEnv,
	HttpRequestOptions,
	HttpResponse,
	StorageChangeEvent
} from '@chronos/core';
import { DEFAULT_USER_PREFERENCES } from '@chronos/core';
import { OfficialPluginService } from './official-plugin-service';
import { loadEsmPluginFromCode } from './plugin-bundle';
import type { OfficialPluginCatalog, PluginManifest } from '@chronos/core';

type HttpMock = Mock<(url: string, options?: HttpRequestOptions) => Promise<HttpResponse>>;

const SAMPLE_BUNDLE = `
export default {
  id: 'test-plugin',
  name: function () { return 'Test'; },
  version: '1.0.0',
  apply: function (ctx) {
    ctx.registerSlot('mine.item', {
      id: 'test-item',
      sectionId: 'app-support',
      title: function () { return 'Test'; },
      href: '/test',
      order: 1
    });
  }
};
`;

function httpResponse(overrides: Partial<HttpResponse> = {}): HttpResponse {
	return {
		status: 200,
		statusText: 'OK',
		headers: {},
		ok: true,
		text: async () => '',
		json: async <T>() => undefined as T,
		bytes: async () => new Uint8Array(),
		...overrides
	};
}

function createMockEnv(httpRequest: HttpMock = vi.fn()) {
	const kv = new Map<string, unknown>();

	const env: ChronosEnv = {
		platform: 'node',
		http: {
			request: httpRequest
		},
		storage: {
			getTimetable: async () => null,
			listTimetables: async () => [],
			saveTimetable: async () => {},
			deleteTimetable: async () => {},
			getActiveTimetableId: async () => null,
			setActiveTimetableId: async () => {},
			queryCourses: async () => [],
			getPreferences: async () => ({ ...DEFAULT_USER_PREFERENCES }),
			savePreferences: async () => {},
			getPluginData: async <T>(pluginId: string, key: string): Promise<T | null> =>
				(kv.get(`${pluginId}:${key}`) as T) ?? null,
			setPluginData: async <T>(pluginId: string, key: string, val: T): Promise<void> => {
				kv.set(`${pluginId}:${key}`, val);
			},
			deletePluginData: async (pluginId: string, key: string): Promise<void> => {
				kv.delete(`${pluginId}:${key}`);
			},
			clearPluginData: async (pluginId: string): Promise<void> => {
				for (const key of kv.keys()) {
					if (key.startsWith(`${pluginId}:`)) kv.delete(key);
				}
			},
			onChanged: (_l: (e: StorageChangeEvent) => void) => ({ dispose: () => {} })
		},
		vault: {
			isSupported: async () => false,
			storeSecret: vi.fn(),
			getSecret: vi.fn(),
			removeSecret: vi.fn()
		},
		runtime: {
			sha256: async (data: string) => {
				const { createHash } = await import('node:crypto');
				return createHash('sha256').update(data).digest('hex');
			}
		}
	};

	return { env, httpRequest };
}

describe('loadEsmPluginFromCode', () => {
	it('parses export default ESM plugin objects', async () => {
		const plugin = await loadEsmPluginFromCode(SAMPLE_BUNDLE);
		expect(plugin.id).toBe('test-plugin');
		expect(typeof plugin.apply).toBe('function');
	});

	it('rejects bundles without apply()', async () => {
		await expect(loadEsmPluginFromCode('export default { id: "x" };')).rejects.toThrow(
			/Invalid plugin bundle/
		);
	});
});

describe('OfficialPluginService', () => {
	let engine: ChronosEngine;
	let service: OfficialPluginService;
	let httpRequest: HttpMock;

	beforeEach(async () => {
		httpRequest = vi.fn();
		const mock = createMockEnv(httpRequest);
		engine = new ChronosEngine({ env: mock.env, onNotification: vi.fn() });
		await engine.init();
		service = new OfficialPluginService(engine);
	});

	it('fetches and parses official plugin catalog', async () => {
		const catalog: OfficialPluginCatalog = {
			version: 1,
			updatedAt: Date.now(),
			manifests: ['/official-plugins/manifests/test.manifest.json']
		};

		httpRequest.mockResolvedValueOnce(
			httpResponse({
				json: async <T>() => catalog as T
			})
		);

		const result = await service.fetchCatalog('/official-plugins/catalog.json');
		expect(result.manifests.length).toBe(1);
	});

	it('installs plugin via loadPlugin after sha256 verification', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));

		await service.install(manifest);
		expect(engine.isPluginLoaded('test-plugin')).toBe(true);
		expect(service.listInstalled().length).toBe(1);
	});

	it('rejects install when minEngineVersion is newer than current engine', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '2.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '99.0.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		await expect(service.install(manifest)).rejects.toThrow(/requires engine >= 99\.0\.0/);
	});

	it('rejects install when sha256 mismatch', async () => {
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: 'deadbeef'
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));

		await expect(service.install(manifest)).rejects.toThrow(/integrity check failed/);
	});

	it('uninstalls plugin and clears engine state', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));
		await service.install(manifest);
		await service.uninstall('test-plugin');
		expect(engine.isPluginLoaded('test-plugin')).toBe(false);
	});

	it('uninstall wipes plugin-namespaced data', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));
		await service.install(manifest);

		await engine.storage.setPluginData('test-plugin', 'wallpaper_image', { base64: 'x' });
		expect(await engine.storage.getPluginData('test-plugin', 'wallpaper_image')).not.toBeNull();

		await service.uninstall('test-plugin');

		expect(await engine.storage.getPluginData('test-plugin', 'wallpaper_image')).toBeNull();
		expect(
			await engine.storage.getPluginData('core.official-plugins', 'installed_plugins')
		).not.toBeNull();
	});

	it('skips init reload for profile-builtin plugins already loaded', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		await engine.loadPlugin(await loadEsmPluginFromCode(SAMPLE_BUNDLE));
		expect(engine.slots.getSlotItem('mine.item', 'test-item')).toBeDefined();

		await engine.storage.setPluginData('core.official-plugins', 'installed_plugins', [
			{
				manifest,
				code: SAMPLE_BUNDLE,
				enabled: true,
				installedAt: Date.now()
			}
		]);

		const loadPluginSpy = vi.spyOn(engine, 'loadPlugin');
		await service.init();

		expect(loadPluginSpy).not.toHaveBeenCalled();
		expect(engine.isPluginLoaded('test-plugin')).toBe(true);
		expect(engine.slots.getSlotItem('mine.item', 'test-item')).toBeDefined();
		expect(service.listInstalled()).toHaveLength(0);

		const stored = await engine.storage.getPluginData<unknown[]>(
			'core.official-plugins',
			'installed_plugins'
		);
		expect(stored).toEqual([]);
	});

	it('resetAfterFactoryClear unloads plugins and clears installed cache', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));
		await service.install(manifest);
		expect(engine.isPluginLoaded('test-plugin')).toBe(true);
		expect(service.listInstalled()).toHaveLength(1);

		await service.resetAfterFactoryClear();

		expect(engine.isPluginLoaded('test-plugin')).toBe(false);
		expect(service.listInstalled()).toHaveLength(0);
		expect(service.isPluginActive('test-plugin')).toBe(false);
	});

	it('installs from manifest URL', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Link' },
			version: '1.0.0',
			description: { 'zh-CN': 'Link plugin' },
			author: 'Community',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: 'bundle.js',
			sha256: hash
		};
		const manifestUrl = 'https://cdn.example.com/plugins/link/manifest.json';

		httpRequest.mockImplementation(async (url: string) => {
			if (url === manifestUrl) {
				return httpResponse({ json: async <T>() => manifest as T });
			}
			if (url === 'https://cdn.example.com/plugins/link/bundle.js') {
				return httpResponse({ text: async () => SAMPLE_BUNDLE });
			}
			throw new Error(`Unexpected URL: ${url}`);
		});

		await service.installFromManifestUrl(manifestUrl);
		expect(engine.isPluginLoaded('test-plugin')).toBe(true);
		expect(httpRequest).toHaveBeenCalledWith(
			'https://cdn.example.com/plugins/link/bundle.js',
			expect.anything()
		);
	});

	it('rejects invalid manifest install URLs', async () => {
		await expect(service.installFromManifestUrl('javascript:alert(1)')).rejects.toThrow(
			/http or https/
		);
	});

	it('detects catalog updates for installed plugins', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const installedManifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};
		const remoteManifest: PluginManifest = {
			...installedManifest,
			version: '2.0.0'
		};
		const manifestUrl = '/official-plugins/manifests/test.manifest.json';

		httpRequest.mockImplementation(async (url: string) => {
			if (url === '/official-plugins/catalog.json') {
				return httpResponse({
					json: async <T>() =>
						({
							version: 1,
							updatedAt: Date.now(),
							manifests: [manifestUrl]
						}) as T
				});
			}
			if (url === manifestUrl) {
				return httpResponse({ json: async <T>() => remoteManifest as T });
			}
			if (url === '/test.bundle.js' || url === 'http://localhost/test.bundle.js') {
				return httpResponse({ text: async () => SAMPLE_BUNDLE });
			}
			throw new Error(`Unexpected URL: ${url}`);
		});

		await service.install(installedManifest, manifestUrl);

		const offers = await service.checkForUpdates();
		expect(offers).toHaveLength(1);
		expect(offers[0]).toMatchObject({
			pluginId: 'test-plugin',
			currentVersion: '1.0.0',
			latestVersion: '2.0.0',
			manifestUrl
		});
	});

	it('detects link-installed plugin updates via manifestUrl', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const installedManifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Link' },
			version: '1.0.0',
			description: { 'zh-CN': 'Link plugin' },
			author: 'Community',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: 'bundle.js',
			sha256: hash
		};
		const remoteManifest: PluginManifest = {
			...installedManifest,
			version: '1.1.0'
		};
		const manifestUrl = 'https://cdn.example.com/plugins/link/manifest.json';

		httpRequest.mockImplementation(async (url: string) => {
			if (url === '/official-plugins/catalog.json') {
				return httpResponse({
					json: async <T>() =>
						({
							version: 1,
							updatedAt: Date.now(),
							manifests: []
						}) as T
				});
			}
			if (url === manifestUrl) {
				return httpResponse({ json: async <T>() => remoteManifest as T });
			}
			if (url === 'https://cdn.example.com/plugins/link/bundle.js') {
				return httpResponse({ text: async () => SAMPLE_BUNDLE });
			}
			throw new Error(`Unexpected URL: ${url}`);
		});

		await service.install(installedManifest, manifestUrl);

		const offers = await service.checkForUpdates();
		expect(offers).toHaveLength(1);
		expect(offers[0]?.latestVersion).toBe('1.1.0');
	});

	it('updates installed plugin and preserves plugin data', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const installedManifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};
		const remoteManifest: PluginManifest = {
			...installedManifest,
			version: '2.0.0'
		};
		const manifestUrl = '/official-plugins/manifests/test.manifest.json';

		httpRequest.mockImplementation(async (url: string) => {
			if (url === '/test.bundle.js' || url === 'http://localhost/test.bundle.js') {
				return httpResponse({ text: async () => SAMPLE_BUNDLE });
			}
			if (url === manifestUrl) {
				return httpResponse({ json: async <T>() => remoteManifest as T });
			}
			throw new Error(`Unexpected URL: ${url}`);
		});

		await service.install(installedManifest, manifestUrl);
		await engine.storage.setPluginData('test-plugin', 'wallpaper_image', { base64: 'keep-me' });

		await service.updateInstalled('test-plugin', manifestUrl);

		expect(service.getInstalled('test-plugin')?.manifest.version).toBe('2.0.0');
		expect(await engine.storage.getPluginData('test-plugin', 'wallpaper_image')).toEqual({
			base64: 'keep-me'
		});
	});

	it('update keeps disabled plugins inactive', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const installedManifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};
		const remoteManifest: PluginManifest = {
			...installedManifest,
			version: '2.0.0'
		};
		const manifestUrl = '/official-plugins/manifests/test.manifest.json';

		httpRequest.mockImplementation(async (url: string) => {
			if (url === '/test.bundle.js' || url === 'http://localhost/test.bundle.js') {
				return httpResponse({ text: async () => SAMPLE_BUNDLE });
			}
			if (url === manifestUrl) {
				return httpResponse({ json: async <T>() => remoteManifest as T });
			}
			throw new Error(`Unexpected URL: ${url}`);
		});

		await service.install(installedManifest, manifestUrl);
		await service.disable('test-plugin');
		expect(engine.isPluginLoaded('test-plugin')).toBe(false);

		await service.updateInstalled('test-plugin', manifestUrl);

		expect(service.getInstalled('test-plugin')?.manifest.version).toBe('2.0.0');
		expect(service.getInstalled('test-plugin')?.enabled).toBe(false);
		expect(engine.isPluginLoaded('test-plugin')).toBe(false);
	});

	it('uses prefetched catalog manifests without refetching catalog', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const installedManifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			minEngineVersion: '0.3.0',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};
		const remoteManifest: PluginManifest = {
			...installedManifest,
			version: '2.0.0'
		};
		const manifestUrl = '/official-plugins/manifests/test.manifest.json';

		httpRequest.mockImplementation(async (url: string) => {
			if (url === '/test.bundle.js' || url === 'http://localhost/test.bundle.js') {
				return httpResponse({ text: async () => SAMPLE_BUNDLE });
			}
			throw new Error(`Unexpected URL: ${url}`);
		});

		await service.install(installedManifest, manifestUrl);
		httpRequest.mockClear();

		const offers = await service.checkForUpdates(
			'/official-plugins/catalog.json',
			new Map([
				[
					'test-plugin',
					{
						manifest: remoteManifest,
						manifestUrl
					}
				]
			])
		);

		expect(offers).toHaveLength(1);
		expect(httpRequest).not.toHaveBeenCalled();
	});
});
