import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test';
import {
	enqueuePluginHmr,
	handlePluginHmr,
	resetPluginHmrForTesting,
	setupPluginHmr
} from './official-plugin-hmr';
import type { OfficialPluginService } from './official-plugin-service';
import type { ChronosEngine } from '@chronos/core';
import type { InstalledOfficialPluginRecord } from './official-plugin-types';

describe('official-plugin-hmr', () => {
	let mockService: Partial<OfficialPluginService>;
	let mockEngine: Partial<ChronosEngine>;
	let applyHotUpdateFn: ReturnType<typeof vi.fn>;
	let notifyFn: ReturnType<typeof vi.fn>;
	let setThemeFn: ReturnType<typeof vi.fn>;
	let installedMap: Map<string, InstalledOfficialPluginRecord>;

	const sampleRecord: InstalledOfficialPluginRecord = {
		manifest: {
			id: 'tool-test',
			name: { 'zh-CN': '测试插件', en: 'Test Plugin' },
			description: { 'zh-CN': '测试插件描述', en: 'Test Description' },
			author: 'Chronos',
			version: '1.0.0',
			type: 'tool',
			bundleFormat: 'esm'
		},
		code: 'export default { id: "tool-test", apply: () => {} };',
		cssCode: '.test { color: red; }',
		colorsJson: null,
		iconThemeJson: null,
		enabled: true,
		installedAt: 1000
	};

	afterEach(() => {
		resetPluginHmrForTesting();
		vi.unstubAllGlobals();
	});
	beforeEach(() => {
		resetPluginHmrForTesting();
		vi.stubGlobal('window', {});
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('[]')));
		installedMap = new Map([['tool-test', { ...sampleRecord }]]);
		applyHotUpdateFn = vi.fn().mockImplementation(async (data) => {
			const existing = installedMap.get(data.id)!;
			const updated = {
				...existing,
				code: data.code,
				cssCode: data.cssCode,
				installedAt: Date.now()
			};
			installedMap.set(data.id, updated);
			return updated;
		});
		notifyFn = vi.fn();
		setThemeFn = vi.fn();

		mockService = {
			getInstalled: vi.fn().mockImplementation((id: string) => installedMap.get(id)),
			applyHotUpdate: applyHotUpdateFn as any
		};

		mockEngine = {
			notify: notifyFn,
			setTheme: setThemeFn,
			state: {
				activeThemeId: 'theme-test'
			}
		} as any;
	});

	it('hot-reloads an active installed plugin through applyHotUpdate', async () => {
		await handlePluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine, {
			id: 'tool-test',
			type: 'tool',
			rev: 'abc1',
			costMs: '12.5',
			code: 'export default { id: "tool-test", v: 2, apply: () => {} };',
			cssCode: '.test { color: blue; }',
			colorsJson: null,
			iconThemeJson: null
		});

		expect(applyHotUpdateFn).toHaveBeenCalled();
		expect(notifyFn).toHaveBeenCalledWith(
			expect.stringContaining('[HMR] 插件 tool-test 已热重载 (12.5ms)'),
			'info'
		);
	});

	it('updates disabled plugin in store without activating runtime', async () => {
		installedMap.set('tool-test', { ...sampleRecord, enabled: false });

		await handlePluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine, {
			id: 'tool-test',
			rev: 'abc2',
			costMs: '8.0',
			code: 'new code',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		});

		expect(applyHotUpdateFn).toHaveBeenCalled();
		expect(notifyFn).toHaveBeenCalledWith(
			expect.stringContaining('[HMR] 插件 tool-test 已更新 (8.0ms，未启用)'),
			'info'
		);
	});

	it('notifies when plugin is not installed', async () => {
		await handlePluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine, {
			id: 'unknown-plugin',
			rev: 'abc3',
			costMs: '5.0',
			code: 'code',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		});

		expect(applyHotUpdateFn).not.toHaveBeenCalled();
		expect(notifyFn).toHaveBeenCalledWith(
			expect.stringContaining('[HMR] 插件 unknown-plugin 已重编 (5.0ms，未安装)'),
			'info'
		);
	});

	it('re-applies theme when a theme plugin is hot-reloaded and active', async () => {
		const themeRecord: InstalledOfficialPluginRecord = {
			manifest: {
				id: 'theme-test',
				name: { 'zh-CN': '主题', en: 'Theme' },
				description: { 'zh-CN': '主题描述', en: 'Theme Description' },
				author: 'Chronos',
				version: '1.0.0',
				type: 'theme',
				bundleFormat: 'esm',
				themeId: 'theme-test'
			},
			code: null,
			cssCode: null,
			colorsJson: '{"id":"theme-test"}',
			iconThemeJson: null,
			enabled: true,
			installedAt: 1000
		};
		installedMap.set('theme-test', themeRecord);
		applyHotUpdateFn.mockImplementation(async (data) => ({
			...themeRecord,
			colorsJson: data.colorsJson
		}));

		await handlePluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine, {
			id: 'theme-test',
			type: 'theme',
			rev: 'rev4',
			costMs: '2.0',
			code: null,
			cssCode: null,
			colorsJson: '{"id":"theme-test","updated":true}',
			iconThemeJson: null
		});

		expect(setThemeFn).toHaveBeenCalledWith('theme-test');
	});

	it('catches and reports error gracefully when applyHotUpdate fails', async () => {
		applyHotUpdateFn.mockRejectedValue(new Error('Syntax error in plugin'));

		await handlePluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine, {
			id: 'tool-test',
			rev: 'rev5',
			costMs: '10.0',
			code: 'broken code',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		});

		expect(notifyFn).toHaveBeenCalledWith(
			expect.stringContaining('[HMR] 热重载 tool-test 失败: Syntax error in plugin'),
			'error'
		);
	});

	it('serializes hot-reload handling per plugin id', async () => {
		setupPluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine);
		let releaseFirst: (() => void) | undefined;
		const firstGate = new Promise<void>((resolve) => {
			releaseFirst = resolve;
		});
		const callOrder: string[] = [];

		applyHotUpdateFn.mockImplementation(async () => {
			callOrder.push('apply-start');
			await firstGate;
			callOrder.push('apply-end');
			return installedMap.get('tool-test')!;
		});

		void enqueuePluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine, {
			id: 'tool-test',
			type: 'tool',
			rev: 'rev-a',
			costMs: '1.0',
			code: 'code-a',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		});
		void enqueuePluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine, {
			id: 'tool-test',
			type: 'tool',
			rev: 'rev-b',
			costMs: '2.0',
			code: 'code-b',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		});

		await vi.waitFor(() => {
			expect(callOrder).toContain('apply-start');
		});
		expect(callOrder.filter((entry) => entry === 'apply-start')).toHaveLength(1);

		releaseFirst?.();
		await vi.waitFor(() => {
			expect(callOrder.filter((entry) => entry === 'apply-end')).toHaveLength(2);
		});
		expect(applyHotUpdateFn).toHaveBeenCalledTimes(2);
	});

	it('bootstrap response cannot overwrite a realtime revision received while fetch was pending', async () => {
		resetPluginHmrForTesting();
		let release!: (value: Response) => void;
		vi.stubGlobal(
			'fetch',
			vi.fn(
				() =>
					new Promise<Response>((resolve) => {
						release = resolve;
					})
			)
		);
		const service = mockService as OfficialPluginService;
		const engine = mockEngine as ChronosEngine;
		const lifecycle = setupPluginHmr(service, engine);
		const payload = {
			id: 'tool-test',
			rev: 'live',
			costMs: '1',
			code: 'new',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		};
		void enqueuePluginHmr(service, engine, payload);
		await vi.waitFor(() => expect(installedMap.get('tool-test')?.code).toBe('new'));
		release(new Response(JSON.stringify([{ ...payload, rev: 'boot', code: 'old' }])));
		for (let i = 0; i < 20; i++) await Promise.resolve();
		expect(installedMap.get('tool-test')?.code).toBe('new');
		lifecycle.dispose();
		vi.unstubAllGlobals();
	});

	it('finishes running bootstrap before live updates and deduplicates opaque revisions', async () => {
		const service = mockService as OfficialPluginService;
		const engine = mockEngine as ChronosEngine;
		const payload = {
			id: 'tool-test',
			rev: 'z-bootstrap',
			costMs: '1',
			code: 'boot',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		};
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([payload]))));
		let release!: () => void;
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		const original =
			applyHotUpdateFn.getMockImplementation() as OfficialPluginService['applyHotUpdate'];
		applyHotUpdateFn.mockImplementationOnce(async (data, options) => {
			await gate;
			return original(data, options);
		});
		const lifecycle = setupPluginHmr(service, engine);
		await vi.waitFor(() => expect(applyHotUpdateFn).toHaveBeenCalledTimes(1));
		const live = { ...payload, rev: 'a-live', code: 'live' };
		const next = enqueuePluginHmr(service, engine, live);
		const duplicate = enqueuePluginHmr(service, engine, live);
		expect(installedMap.get('tool-test')?.code).toBe(sampleRecord.code);
		release();
		await next;
		await duplicate;
		expect(installedMap.get('tool-test')?.code).toBe('live');
		expect(applyHotUpdateFn).toHaveBeenCalledTimes(2);
		lifecycle.dispose();
	});
	it('failure does not block later updates and queued work rechecks uninstall and enabled state', async () => {
		const service = mockService as OfficialPluginService;
		const engine = mockEngine as ChronosEngine;
		setupPluginHmr(service, engine);
		const payload = {
			id: 'tool-test',
			rev: 'bad',
			costMs: '1',
			code: 'bad',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		};
		applyHotUpdateFn.mockRejectedValueOnce(new Error('broken'));
		const failure = enqueuePluginHmr(service, engine, payload);
		const good = enqueuePluginHmr(service, engine, { ...payload, rev: 'good', code: 'good' });
		await failure;
		await good;
		expect(installedMap.get('tool-test')?.code).toBe('good');
		const disabled = enqueuePluginHmr(service, engine, {
			...payload,
			rev: 'disabled',
			code: 'disabled'
		});
		installedMap.set('tool-test', { ...installedMap.get('tool-test')!, enabled: false });
		await disabled;
		expect(installedMap.get('tool-test')).toMatchObject({ enabled: false, code: 'disabled' });
		const removed = enqueuePluginHmr(service, engine, { ...payload, rev: 'removed' });
		installedMap.delete('tool-test');
		await removed;
		expect(installedMap.has('tool-test')).toBe(false);
		expect(applyHotUpdateFn).toHaveBeenCalledTimes(3);
	});
	it('dispose aborts bootstrap and running work, drops queued work and waits for rollback before a replacement session', async () => {
		const service = mockService as OfficialPluginService;
		const engine = mockEngine as ChronosEngine;
		const payload = {
			id: 'tool-test',
			rev: 'first',
			costMs: '1',
			code: 'first',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		};
		let fetchSignal: AbortSignal | undefined;
		vi.stubGlobal(
			'fetch',
			vi.fn((_url, options) => {
				fetchSignal = options.signal;
				return new Promise(() => {});
			})
		);
		const lifecycle = setupPluginHmr(service, engine);
		let release!: () => void;
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		let updateSignal: AbortSignal | undefined;
		applyHotUpdateFn.mockImplementationOnce(async (_data, options) => {
			updateSignal = options.signal;
			await gate;
			options.signal.throwIfAborted();
			return sampleRecord;
		});
		const first = enqueuePluginHmr(service, engine, payload);
		const queued = enqueuePluginHmr(service, engine, { ...payload, rev: 'queued' });
		await vi.waitFor(() => expect(updateSignal).toBeDefined());
		lifecycle.dispose();
		expect(fetchSignal?.aborted).toBe(true);
		expect(updateSignal?.aborted).toBe(true);
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('[]')));
		const replacement = setupPluginHmr(service, engine);
		const last = enqueuePluginHmr(service, engine, {
			...payload,
			rev: 'replacement',
			code: 'replacement'
		});
		await Promise.resolve();
		expect(applyHotUpdateFn).toHaveBeenCalledTimes(1);
		release();
		await first;
		await queued;
		await last;
		expect(applyHotUpdateFn).toHaveBeenCalledTimes(2);
		expect(installedMap.get('tool-test')?.code).toBe('replacement');
		replacement.dispose();
	});
	it('setupPluginHmr returns a disposable and manages service reference', () => {
		resetPluginHmrForTesting();
		const disposable = setupPluginHmr(
			mockService as OfficialPluginService,
			mockEngine as ChronosEngine
		);
		expect(typeof disposable.dispose).toBe('function');
		disposable.dispose();
		resetPluginHmrForTesting();
	});
});
