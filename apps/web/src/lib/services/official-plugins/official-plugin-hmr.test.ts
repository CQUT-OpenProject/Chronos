import { describe, expect, it, vi, beforeEach } from 'vite-plus/test';
import { handlePluginHmr, resetPluginHmrForTesting, setupPluginHmr } from './official-plugin-hmr';
import type { OfficialPluginService } from './official-plugin-service';
import type { ChronosEngine } from '@chronos/core';
import type { InstalledOfficialPluginRecord } from './official-plugin-types';

describe('official-plugin-hmr', () => {
	let mockService: Partial<OfficialPluginService>;
	let mockEngine: Partial<ChronosEngine>;
	let mockActivator: {
		deactivate: ReturnType<typeof vi.fn>;
		activate: ReturnType<typeof vi.fn>;
	};
	let notifyFn: ReturnType<typeof vi.fn>;
	let setThemeFn: ReturnType<typeof vi.fn>;
	let updateRecordFn: ReturnType<typeof vi.fn>;
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
		mockActivator = {
			deactivate: vi.fn().mockResolvedValue(undefined),
			activate: vi.fn().mockResolvedValue({ dispose: vi.fn() })
		};
		notifyFn = vi.fn();
		setThemeFn = vi.fn();
		updateRecordFn = vi.fn().mockImplementation((rec) => {
			installedMap.set(rec.manifest.id, rec);
			return Promise.resolve();
		});

		mockService = {
			getInstalled: vi.fn().mockImplementation((id: string) => installedMap.get(id)),
			getRuntimeActivator: vi.fn().mockReturnValue(mockActivator as any),
			updateRecord: updateRecordFn as any
		};

		mockEngine = {
			notify: notifyFn,
			setTheme: setThemeFn,
			state: {
				activeThemeId: 'theme-test'
			}
		} as any;
	});

	it('hot-reloads an active installed plugin by deactivating and reactivating with new assets', async () => {
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

		expect(mockActivator.deactivate).toHaveBeenCalledWith('tool-test', { revertThemes: false });
		expect(mockActivator.activate).toHaveBeenCalledWith(
			expect.objectContaining({
				code: 'export default { id: "tool-test", v: 2, apply: () => {} };',
				cssCode: '.test { color: blue; }'
			})
		);
		expect(updateRecordFn).toHaveBeenCalled();
		expect(notifyFn).toHaveBeenCalledWith(
			expect.stringContaining('[HMR] 插件 tool-test 已热重载 (12.5ms)'),
			'info'
		);
	});

	it('clears cssCode to null when hot-reloading tool plugin with no CSS', async () => {
		await handlePluginHmr(mockService as OfficialPluginService, mockEngine as ChronosEngine, {
			id: 'tool-test',
			type: 'tool',
			rev: 'abc-nocss',
			costMs: '10.0',
			code: 'export default { id: "tool-test", v: 3, apply: () => {} };',
			cssCode: null,
			colorsJson: null,
			iconThemeJson: null
		});

		expect(mockActivator.activate).toHaveBeenCalledWith(
			expect.objectContaining({
				code: 'export default { id: "tool-test", v: 3, apply: () => {} };',
				cssCode: null
			})
		);
		const savedRecord = installedMap.get('tool-test');
		expect(savedRecord?.cssCode).toBeNull();
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

		expect(mockActivator.deactivate).not.toHaveBeenCalled();
		expect(mockActivator.activate).not.toHaveBeenCalled();
		expect(updateRecordFn).toHaveBeenCalledWith(
			expect.objectContaining({
				code: 'new code'
			})
		);
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

		expect(mockActivator.deactivate).not.toHaveBeenCalled();
		expect(mockActivator.activate).not.toHaveBeenCalled();
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

		expect(mockActivator.deactivate).toHaveBeenCalledWith('theme-test', { revertThemes: false });
		expect(mockActivator.activate).toHaveBeenCalledWith(
			expect.objectContaining({
				colorsJson: '{"id":"theme-test","updated":true}'
			})
		);
		expect(setThemeFn).toHaveBeenCalledWith('theme-test');
	});

	it('catches and reports error gracefully when activation fails without crashing', async () => {
		mockActivator.activate.mockRejectedValue(new Error('Syntax error in plugin'));

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
