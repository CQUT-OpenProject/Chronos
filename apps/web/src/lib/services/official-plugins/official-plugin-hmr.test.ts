import { describe, expect, it, vi, beforeEach } from 'vite-plus/test';
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

	beforeEach(() => {
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

		enqueuePluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine, {
			id: 'tool-test',
			type: 'tool',
			rev: 'rev-a',
			costMs: '1.0',
			code: 'code-a',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		});
		enqueuePluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine, {
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
