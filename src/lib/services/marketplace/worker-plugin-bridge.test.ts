import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import {
	ChronosEngine,
	type ChronosEnv,
	type HttpResponse,
	type PluginManifest,
	type UserPreferences
} from '@chronos/core';
import { WorkerPluginBridge, type WorkerRpcMessage } from './worker-plugin-bridge';

class MockWorker implements Worker {
	onmessage: ((this: Worker, ev: MessageEvent<WorkerRpcMessage>) => unknown) | null = null;
	onmessageerror: ((this: Worker, ev: MessageEvent) => unknown) | null = null;
	onerror: ((this: AbstractWorker, ev: ErrorEvent) => unknown) | null = null;
	sentMessages: WorkerRpcMessage[] = [];
	terminated = false;

	postMessage(message: WorkerRpcMessage): void {
		this.sentMessages.push(message);
	}

	terminate(): void {
		this.terminated = true;
	}

	addEventListener = vi.fn();
	removeEventListener = vi.fn();
	dispatchEvent = vi.fn(() => true);

	async simulateMessageFromWorker(data: WorkerRpcMessage): Promise<void> {
		if (this.onmessage) {
			await this.onmessage.call(this, { data } as MessageEvent<WorkerRpcMessage>);
		}
	}
}

interface TestEnvState {
	networkRequests: Array<{ url: string; options?: unknown }>;
	storageSets: Array<{ pluginId: string; key: string; value: unknown }>;
}

function createMockEnv(stateTracker: TestEnvState): ChronosEnv {
	const pluginStore = new Map<string, unknown>();
	return {
		platform: 'web',
		http: {
			request: async (url: string, options?: unknown): Promise<HttpResponse> => {
				stateTracker.networkRequests.push({ url, options });
				return {
					status: 200,
					statusText: 'OK',
					headers: {},
					ok: true,
					text: async () => 'ok',
					json: async <T>() => ({ url }) as T,
					bytes: async () => new Uint8Array([1, 2, 3])
				};
			}
		},
		storage: {
			getTimetable: async () => null,
			listTimetables: async () => [],
			saveTimetable: async () => {},
			patchTimetable: async () => {},
			deleteTimetable: async () => {},
			getActiveTimetableId: async () => null,
			setActiveTimetableId: async () => {},
			getPreferences: async (): Promise<UserPreferences> => ({
				schemaVersion: 1,
				themeMode: 'auto',
				paletteMode: 'vibrant',
				timetableLayoutMode: 'fixed',
				capsuleCornerStyle: 'rounded',
				hapticFeedbackEnabled: true
			}),
			savePreferences: async () => {},
			getPluginData: async <T>(_pluginId: string, key: string): Promise<T | null> => {
				return (pluginStore.get(key) as T) ?? null;
			},
			setPluginData: async <T>(pluginId: string, key: string, value: T): Promise<void> => {
				stateTracker.storageSets.push({ pluginId, key, value });
				pluginStore.set(key, value);
			},
			deletePluginData: async (_pluginId: string, key: string): Promise<void> => {
				pluginStore.delete(key);
			}
		},
		vault: {
			isSupported: async () => true,
			storeSecret: vi.fn(async () => {}),
			getSecret: vi.fn(async () => null),
			removeSecret: vi.fn(async () => {})
		},
		runtime: {
			setTimeout: (handler, timeoutMs) => setTimeout(handler, timeoutMs) as unknown as number,
			clearTimeout: (handle) => clearTimeout(handle),
			sha256: async () => '',
			encodeUtf8: (str) => new TextEncoder().encode(str),
			decodeUtf8: (bytes) => new TextDecoder().decode(bytes)
		}
	};
}

describe('WorkerPluginBridge', () => {
	let tracker: TestEnvState;
	let env: ChronosEnv;
	let engine: ChronosEngine;
	let mockWorker: MockWorker;

	beforeEach(async () => {
		tracker = {
			networkRequests: [],
			storageSets: []
		};
		env = createMockEnv(tracker);
		engine = new ChronosEngine({ env });
		await engine.init();
		mockWorker = new MockWorker();
	});

	it('intercepts network requests when network capability is missing', async () => {
		const manifest: PluginManifest = {
			id: 'untrusted-plugin',
			name: { 'zh-CN': '未授权插件' },
			version: '1.0.0',
			description: { 'zh-CN': '测试' },
			author: 'Test',
			type: 'tool',
			bundleFormat: 'iife',
			minEngineVersion: '1.0.0',
			bundleUrl: '/test.js',
			sha256: '',
			capabilities: []
		};

		const bridge = new WorkerPluginBridge(manifest, '', engine, mockWorker);
		await bridge.start();

		await mockWorker.simulateMessageFromWorker({
			id: 'req-1',
			method: 'http:request',
			params: { url: 'https://example.com' }
		});

		const reply = mockWorker.sentMessages.find((m) => m.id === 'req-1');
		expect(reply).toBeDefined();
		expect(reply?.ok).toBe(false);
		expect(reply?.error).toContain('Permission Denied: network capability required');
		expect(tracker.networkRequests.length).toBe(0);

		bridge.dispose();
	});

	it('permits network and storage requests when capabilities are granted and enforces scoped storage', async () => {
		const manifest: PluginManifest = {
			id: 'trusted-plugin',
			name: { 'zh-CN': '授权插件' },
			version: '1.0.0',
			description: { 'zh-CN': '测试' },
			author: 'Test',
			type: 'tool',
			bundleFormat: 'iife',
			minEngineVersion: '1.0.0',
			bundleUrl: '/test.js',
			sha256: '',
			capabilities: ['network', 'storage']
		};

		const bridge = new WorkerPluginBridge(manifest, '', engine, mockWorker);
		await bridge.start();

		// 1. Network request
		await mockWorker.simulateMessageFromWorker({
			id: 'req-net',
			method: 'http:request',
			params: { url: 'https://api.example.com/data' }
		});
		const netReply = mockWorker.sentMessages.find((m) => m.id === 'req-net');
		expect(netReply?.ok).toBe(true);
		expect(tracker.networkRequests.length).toBe(1);
		expect(tracker.networkRequests[0]?.url).toBe('https://api.example.com/data');

		// 2. Storage write and read (scoped strictly to pluginId)
		await mockWorker.simulateMessageFromWorker({
			id: 'req-set',
			method: 'storage:set',
			params: { key: 'user_setting', value: { dark: true } }
		});

		expect(tracker.storageSets.length).toBe(1);
		expect(tracker.storageSets[0]).toEqual({
			pluginId: 'trusted-plugin',
			key: 'user_setting',
			value: { dark: true }
		});

		bridge.dispose();
	});

	it('bridges slots (source, exporter, courseAction, badge, theme) to ChronosEngine', async () => {
		const manifest: PluginManifest = {
			id: 'multi-feature-plugin',
			name: { 'zh-CN': '全功能插件' },
			version: '1.0.0',
			description: { 'zh-CN': '测试' },
			author: 'Test',
			type: 'tool',
			bundleFormat: 'iife',
			minEngineVersion: '1.0.0',
			bundleUrl: '/test.js',
			sha256: ''
		};

		const bridge = new WorkerPluginBridge(manifest, '', engine, mockWorker);
		await bridge.start();

		// 1. Register source adapter
		await mockWorker.simulateMessageFromWorker({
			id: 'reg-src',
			method: 'slot:registerSource',
			params: { id: 'custom-src', title: '自定义数据源', authType: 'file' }
		});
		const source = engine.slots.getSource('custom-src');
		expect(source).toBeDefined();
		expect(source?.authType).toBe('file');

		// 2. Register exporter adapter
		await mockWorker.simulateMessageFromWorker({
			id: 'reg-exp',
			method: 'slot:registerExporter',
			params: { id: 'custom-exp', title: '自定义导出器' }
		});
		const exporter = engine.slots.getExporter('custom-exp');
		expect(exporter).toBeDefined();

		// 3. Register course action
		await mockWorker.simulateMessageFromWorker({
			id: 'reg-act',
			method: 'slot:registerCourseAction',
			params: { id: 'custom-act', label: '操作' }
		});
		const action = engine.slots.getCourseAction('custom-act');
		expect(action).toBeDefined();

		// 4. Register theme
		await mockWorker.simulateMessageFromWorker({
			id: 'reg-theme',
			method: 'slot:registerTheme',
			params: {
				id: 'custom-theme',
				name: '自定义主题',
				lightTokens: { primary: '#112233' },
				darkTokens: { primary: '#aabbcc' }
			}
		});
		const theme = engine.themes.getTheme('custom-theme');
		expect(theme).toBeDefined();
		expect(theme?.getTokens('light').primary).toBe('#112233');

		// Disposing bridge should unregister all mounted slots
		bridge.dispose();
		expect(engine.slots.getSource('custom-src')).toBeUndefined();
		expect(engine.slots.getExporter('custom-exp')).toBeUndefined();
		expect(engine.slots.getCourseAction('custom-act')).toBeUndefined();
		expect(engine.themes.getTheme('custom-theme')).toBeUndefined();
		expect(mockWorker.terminated).toBe(true);
	});
});
