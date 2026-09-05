import { describe, expect, it, vi, beforeEach, type Mock } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import type {
	ChronosEnv,
	HttpRequestOptions,
	HttpResponse,
	StorageChangeEvent
} from '@chronos/core';
import { DEFAULT_USER_PREFERENCES, PLUGIN_CONFIG_STORAGE_KEY } from '@chronos/core';
import { OfficialPluginService } from './official-plugin-service';
import { OfficialPluginAssetPipeline } from './asset-pipeline';
import { OfficialPluginCatalogClient } from './catalog-client';
import { OfficialPluginInstalledStore } from './installed-store';
import { OfficialPluginRuntimeActivator } from './runtime-activator';
import { INSTALLED_STORAGE_KEY, OFFICIAL_PLUGINS_PLUGIN_ID } from './official-plugin-types';
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

function createService(engine: ChronosEngine, hostVersion = '0.4.1'): OfficialPluginService {
	const installedStore = new OfficialPluginInstalledStore(engine);
	const runtimeActivator = new OfficialPluginRuntimeActivator(engine, (pluginId) =>
		installedStore.has(pluginId)
	);
	return new OfficialPluginService(engine, {
		catalogClient: new OfficialPluginCatalogClient(engine),
		assetPipeline: new OfficialPluginAssetPipeline(engine),
		installedStore,
		runtimeActivator,
		hostVersion
	});
}

const OFFICIAL_MANIFEST_URL = '/official-plugins/manifests/test-plugin.manifest.json';

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

	it('does not fall back to named export plugin', async () => {
		const namedOnly = `
export const plugin = {
  id: 'named-plugin',
  name: function () { return 'Named'; },
  version: '1.0.0',
  apply: function () {}
};
`;
		await expect(loadEsmPluginFromCode(namedOnly)).rejects.toThrow(/Invalid plugin bundle/);
	});
});

describe('OfficialPluginService', () => {
	let engine: ChronosEngine;
	let service: OfficialPluginService;
	let httpRequest: HttpMock;
	let onNotification: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		httpRequest = vi.fn();
		onNotification = vi.fn();
		const mock = createMockEnv(httpRequest);
		engine = new ChronosEngine({
			env: mock.env,
			onNotification: onNotification as (message: string, type: 'error' | 'info' | 'warn') => void
		});
		await engine.init();
		service = createService(engine);
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
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));

		await service.install(manifest);
		expect(engine.isPluginLoaded('test-plugin')).toBe(true);
		expect(service.listInstalled().length).toBe(1);
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
			bundleUrl: '/test.bundle.js',
			sha256: 'deadbeef'
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => SAMPLE_BUNDLE }));

		await expect(service.install(manifest)).rejects.toThrow(/integrity check failed/);
	});

	it('does not persist record when activation fails', async () => {
		const mismatchedBundle = SAMPLE_BUNDLE.replace("id: 'test-plugin'", "id: 'other-plugin'");
		const hash = await engine.env.runtime.sha256(mismatchedBundle);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '1.0.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		httpRequest.mockResolvedValueOnce(httpResponse({ text: async () => mismatchedBundle }));

		await expect(service.install(manifest)).rejects.toThrow(/id mismatch/);
		expect(service.getInstalled('test-plugin')).toBeUndefined();
		expect(service.listInstalled()).toHaveLength(0);
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

	it('activates cached plugins before awaiting catalog sync', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const staleManifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '0.4.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		await engine.storage.setPluginData(OFFICIAL_PLUGINS_PLUGIN_ID, INSTALLED_STORAGE_KEY, [
			{
				manifest: staleManifest,
				code: SAMPLE_BUNDLE,
				manifestUrl: OFFICIAL_MANIFEST_URL,
				enabled: true,
				installedAt: Date.now()
			}
		]);

		const syncSpy = vi
			.spyOn(
				Object.getPrototypeOf(service) as { syncInstalledWithHost(): Promise<void> },
				'syncInstalledWithHost'
			)
			.mockImplementation(() => new Promise(() => {}));

		try {
			const initPromise = service.init();
			await vi.waitFor(() => {
				expect(engine.isPluginLoaded('test-plugin')).toBe(true);
			});
			await expect(
				Promise.race([
					initPromise,
					new Promise((_, reject) => setTimeout(() => reject(new Error('still pending')), 50))
				])
			).rejects.toThrow('still pending');
		} finally {
			syncSpy.mockRestore();
		}
	});

	it('syncs stale official plugins from catalog during init without notifications', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const staleManifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '0.4.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};
		const freshManifest: PluginManifest = {
			...staleManifest,
			version: '0.4.1'
		};

		await engine.storage.setPluginData(OFFICIAL_PLUGINS_PLUGIN_ID, INSTALLED_STORAGE_KEY, [
			{
				manifest: staleManifest,
				code: SAMPLE_BUNDLE,
				manifestUrl: OFFICIAL_MANIFEST_URL,
				enabled: true,
				installedAt: Date.now()
			}
		]);

		httpRequest.mockImplementation(async (url: string) => {
			if (url === '/official-plugins/catalog.json') {
				return httpResponse({
					json: async <T>() =>
						({
							version: 2,
							updatedAt: Date.now(),
							manifests: [OFFICIAL_MANIFEST_URL]
						}) as T
				});
			}
			if (url === OFFICIAL_MANIFEST_URL) {
				return httpResponse({ json: async <T>() => freshManifest as T });
			}
			if (url === '/test.bundle.js' || url === 'http://localhost/test.bundle.js') {
				return httpResponse({ text: async () => SAMPLE_BUNDLE });
			}
			throw new Error(`Unexpected URL: ${url}`);
		});

		await service.init();

		expect(service.getInstalled('test-plugin')?.manifest.version).toBe('0.4.1');
		expect(onNotification).not.toHaveBeenCalled();
	});

	it('does not sync external link installs during init', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const manifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Link' },
			version: '0.4.0',
			description: { 'zh-CN': 'Link plugin' },
			author: 'Community',
			type: 'tool',
			bundleFormat: 'esm',
			bundleUrl: 'bundle.js',
			sha256: hash
		};
		const manifestUrl = 'https://cdn.example.com/plugins/link/manifest.json';

		await engine.storage.setPluginData(OFFICIAL_PLUGINS_PLUGIN_ID, INSTALLED_STORAGE_KEY, [
			{
				manifest,
				code: SAMPLE_BUNDLE,
				manifestUrl,
				enabled: true,
				installedAt: Date.now()
			}
		]);

		await service.init();

		expect(service.getInstalled('test-plugin')?.manifest.version).toBe('0.4.0');
		expect(httpRequest).not.toHaveBeenCalled();
	});

	it('keeps cached official plugins when catalog sync fails during init', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const staleManifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '0.4.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};

		await engine.storage.setPluginData(OFFICIAL_PLUGINS_PLUGIN_ID, INSTALLED_STORAGE_KEY, [
			{
				manifest: staleManifest,
				code: SAMPLE_BUNDLE,
				manifestUrl: OFFICIAL_MANIFEST_URL,
				enabled: true,
				installedAt: Date.now()
			}
		]);

		httpRequest.mockRejectedValueOnce(new Error('offline'));

		await expect(service.init()).resolves.toBeUndefined();
		expect(service.getInstalled('test-plugin')?.manifest.version).toBe('0.4.0');
	});

	it('preserves plugin config when syncing stale official plugins during init', async () => {
		const hash = await engine.env.runtime.sha256(SAMPLE_BUNDLE);
		const staleManifest: PluginManifest = {
			id: 'test-plugin',
			name: { 'zh-CN': 'Test' },
			version: '0.4.0',
			description: { 'zh-CN': 'Test plugin' },
			author: 'Chronos',
			type: 'tool',
			bundleFormat: 'esm',
			bundleUrl: '/test.bundle.js',
			sha256: hash
		};
		const freshManifest: PluginManifest = {
			...staleManifest,
			version: '0.4.1'
		};

		await engine.storage.setPluginData(OFFICIAL_PLUGINS_PLUGIN_ID, INSTALLED_STORAGE_KEY, [
			{
				manifest: staleManifest,
				code: SAMPLE_BUNDLE,
				manifestUrl: OFFICIAL_MANIFEST_URL,
				enabled: true,
				installedAt: Date.now()
			}
		]);
		await engine.storage.setPluginData('test-plugin', PLUGIN_CONFIG_STORAGE_KEY, {
			enabled: true
		});

		httpRequest.mockImplementation(async (url: string) => {
			if (url === '/official-plugins/catalog.json') {
				return httpResponse({
					json: async <T>() =>
						({
							version: 2,
							updatedAt: Date.now(),
							manifests: [OFFICIAL_MANIFEST_URL]
						}) as T
				});
			}
			if (url === OFFICIAL_MANIFEST_URL) {
				return httpResponse({ json: async <T>() => freshManifest as T });
			}
			if (url === '/test.bundle.js' || url === 'http://localhost/test.bundle.js') {
				return httpResponse({ text: async () => SAMPLE_BUNDLE });
			}
			throw new Error(`Unexpected URL: ${url}`);
		});

		await service.init();

		expect(service.getInstalled('test-plugin')?.manifest.version).toBe('0.4.1');
		expect(await service.getPluginConfig<{ enabled: boolean }>('test-plugin')).toEqual({
			enabled: true
		});
	});
});
