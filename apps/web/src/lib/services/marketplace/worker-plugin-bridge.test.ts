import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import {
	ChronosEngine,
	type ChronosEnv,
	type HttpResponse,
	type PluginManifest,
	type UserPreferences
} from '@chronos/core';
import {
	WorkerPluginBridge,
	InProcessSandboxAdapter,
	type WorkerRpcMessage
} from './worker-plugin-bridge';

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

	it('enforces allowedDomains whitelist and blocks unlisted domains', async () => {
		const manifest: PluginManifest = {
			id: 'domain-restricted-plugin',
			name: { 'zh-CN': '域名限制插件' },
			version: '1.0.0',
			description: { 'zh-CN': '测试' },
			author: 'Test',
			type: 'tool',
			bundleFormat: 'iife',
			minEngineVersion: '1.0.0',
			bundleUrl: '/test.js',
			sha256: '',
			capabilities: ['network'],
			allowedDomains: ['*.cqut.edu.cn', 'api.myservice.com']
		};

		const bridge = new WorkerPluginBridge(manifest, '', engine, mockWorker);
		await bridge.start();

		// 1. Allowed domain
		await mockWorker.simulateMessageFromWorker({
			id: 'req-ok',
			method: 'http:request',
			params: { url: 'https://authserver.cqut.edu.cn/login' }
		});
		const okReply = mockWorker.sentMessages.find((m) => m.id === 'req-ok');
		expect(okReply?.ok).toBe(true);

		// 2. Disallowed domain
		await mockWorker.simulateMessageFromWorker({
			id: 'req-blocked',
			method: 'http:request',
			params: { url: 'https://malicious.evil.com/leak' }
		});
		const blockedReply = mockWorker.sentMessages.find((m) => m.id === 'req-blocked');
		expect(blockedReply?.ok).toBe(false);
		expect(blockedReply?.error).toContain('Permission Denied: domain');

		// 3. SSRF Protection: localhost / private IP blocked even if pattern was wildcard
		const wildcardManifest: PluginManifest = {
			...manifest,
			allowedDomains: ['*']
		};
		const wildcardBridge = new WorkerPluginBridge(wildcardManifest, '', engine, mockWorker);
		await wildcardBridge.start();

		await mockWorker.simulateMessageFromWorker({
			id: 'req-ssrf',
			method: 'http:request',
			params: { url: 'http://127.0.0.1:8080/admin' }
		});
		const ssrfReply = mockWorker.sentMessages.find((m) => m.id === 'req-ssrf');
		expect(ssrfReply?.ok).toBe(false);

		bridge.dispose();
		wildcardBridge.dispose();
	});

	it('bridges universal hierarchical slots (import, export, badge, action, mine, screen, theme)', async () => {
		const manifest: PluginManifest = {
			id: 'hierarchical-plugin',
			name: { 'zh-CN': '全插槽插件' },
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

		// 1. Register import source tab
		await mockWorker.simulateMessageFromWorker({
			id: 'reg-import',
			method: 'slot:register',
			params: {
				slotName: 'import.source.tab',
				contribution: {
					id: 'custom-tab',
					title: '自定义导入',
					order: 15,
					inputSchema: {
						token: { type: 'string', title: 'Token' }
					}
				}
			}
		});
		const importTabs = engine.slots.get('import.source.tab');
		expect(importTabs.some((t) => t.id === 'custom-tab')).toBe(true);

		// 2. Register export action
		await mockWorker.simulateMessageFromWorker({
			id: 'reg-export',
			method: 'slot:register',
			params: {
				slotName: 'export.action',
				contribution: {
					id: 'custom-export',
					title: '自定义导出'
				}
			}
		});
		const exportActions = engine.slots.get('export.action');
		expect(exportActions.some((e) => e.id === 'custom-export')).toBe(true);

		// 3. Register mine section and item
		await mockWorker.simulateMessageFromWorker({
			id: 'reg-mine-sec',
			method: 'slot:register',
			params: {
				slotName: 'mine.section',
				contribution: { id: 'custom-sec', title: '扩展分组' }
			}
		});
		await mockWorker.simulateMessageFromWorker({
			id: 'reg-mine-item',
			method: 'slot:register',
			params: {
				slotName: 'mine.item',
				contribution: {
					id: 'custom-item',
					sectionId: 'custom-sec',
					title: '扩展功能',
					href: '/plugins/hierarchical-plugin/overview'
				}
			}
		});
		expect(engine.slots.get('mine.section').some((s) => s.id === 'custom-sec')).toBe(true);
		expect(engine.slots.get('mine.item').some((i) => i.id === 'custom-item')).toBe(true);

		// 4. Register shell route screen
		await mockWorker.simulateMessageFromWorker({
			id: 'reg-screen',
			method: 'slot:register',
			params: {
				slotName: 'shell.route.screen',
				contribution: {
					id: 'overview',
					title: '概览面板',
					schema: { enabled: { type: 'boolean', title: '启用' } }
				}
			}
		});
		expect(engine.slots.get('shell.route.screen').some((s) => s.id === 'overview')).toBe(true);

		// 5. Unregister a slot
		await mockWorker.simulateMessageFromWorker({
			id: 'unreg-screen',
			method: 'slot:unregister',
			params: {
				slotName: 'shell.route.screen',
				id: 'overview'
			}
		});
		expect(engine.slots.get('shell.route.screen').some((s) => s.id === 'overview')).toBe(false);

		// Dispose bridge cleans up everything
		bridge.dispose();
		expect(engine.slots.get('import.source.tab').some((t) => t.id === 'custom-tab')).toBe(false);
		expect(engine.slots.get('export.action').some((e) => e.id === 'custom-export')).toBe(false);
		expect(engine.slots.get('mine.section').some((s) => s.id === 'custom-sec')).toBe(false);
		expect(engine.slots.get('mine.item').some((i) => i.id === 'custom-item')).toBe(false);
	});

	it('applies plugin code in-process and round-trips slot registration', async () => {
		const manifest: PluginManifest = {
			id: 'in-process-plugin',
			name: { 'zh-CN': '进程内' },
			version: '1.0.0',
			description: { 'zh-CN': '测试' },
			author: 'Test',
			type: 'tool',
			bundleFormat: 'iife',
			minEngineVersion: '1.0.0',
			bundleUrl: '/in-process.js',
			sha256: '',
			capabilities: ['storage']
		};
		const code = `
			exports.default = {
				apply(ctx) {
					ctx.registerSlot('mine.item', {
						id: 'hello-item',
						sectionId: 'app-support',
						title: function() { return 'Hello'; }
					});
				}
			};
		`;
		const adapter = new InProcessSandboxAdapter(manifest, code);
		const bridge = new WorkerPluginBridge(manifest, code, engine, adapter);
		await bridge.start();

		await vi.waitFor(() => {
			expect(engine.slots.get('mine.item').some((item) => item.id === 'hello-item')).toBe(true);
		});

		bridge.dispose();
	});
});
