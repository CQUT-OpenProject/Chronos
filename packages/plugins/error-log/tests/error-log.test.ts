import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine, createCapturedError } from '@chronos/core';
import { createMockEnv } from '@chronos/core/test-utils';
import { ERROR_LOG_PLUGIN_ID, ERROR_LOG_STORAGE_KEY } from '../src/constants';
import {
	appendRingBuffer,
	formatErrorLogClipboard,
	parseStoredEntries,
	truncateErrorLogEntry
} from '../src/error-log';
import { createErrorLogPlugin } from '../src/index';
import { createErrorLogRuntime } from '../src/runtime.svelte';

describe('error-log domain', () => {
	it('appendRingBuffer keeps newest entries within max size', () => {
		const entries = Array.from({ length: 100 }, (_, index) =>
			createCapturedError('console', { message: `entry-${index}`, id: `id-${index}`, ts: index })
		);
		const next = appendRingBuffer(entries, createCapturedError('console', { message: 'new' }), 100);
		expect(next).toHaveLength(100);
		expect(next[0]?.message).toBe('entry-1');
		expect(next.at(-1)?.message).toBe('new');
	});

	it('truncates long message and stack', () => {
		const entry = truncateErrorLogEntry(
			createCapturedError('error', {
				message: 'x'.repeat(3000),
				stack: 's'.repeat(9000)
			})
		);
		expect(entry.message.endsWith('…')).toBe(true);
		expect(entry.stack?.endsWith('…')).toBe(true);
	});

	it('dedupes entries by id when rendering newest first', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.loadPlugin(createErrorLogPlugin());
		const ctx = engine.getPluginContext(ERROR_LOG_PLUGIN_ID);
		const runtime = createErrorLogRuntime(ctx);

		const duplicateId = 'dup-id';
		await runtime.append(
			createCapturedError('console', { message: 'older', id: duplicateId, ts: 1 })
		);
		await runtime.append(
			createCapturedError('console', { message: 'newer', id: duplicateId, ts: 2 })
		);

		const seen = new Set<string>();
		const deduped = [...runtime.entries]
			.sort((a, b) => b.ts - a.ts)
			.filter((entry) => {
				if (seen.has(entry.id)) return false;
				seen.add(entry.id);
				return true;
			});

		expect(deduped).toHaveLength(1);
		expect(deduped[0]?.message).toBe('newer');

		engine.dispose();
	});

	it('parseStoredEntries ignores invalid payloads', () => {
		expect(parseStoredEntries(null)).toEqual([]);
		expect(parseStoredEntries([{ id: 'x' }])).toEqual([]);
		expect(
			parseStoredEntries([createCapturedError('error', { message: 'ok', id: '1', ts: 1 })])
		).toHaveLength(1);
	});

	it('formats clipboard text with version and user agent', () => {
		const entry = createCapturedError('error', {
			id: '1',
			ts: Date.parse('2026-09-14T12:00:00.000Z'),
			name: 'TypeError',
			message: 'boom',
			stack: 'at main'
		});
		const text = formatErrorLogClipboard([entry], {
			pluginVersion: '1.0.0',
			userAgent: 'test-agent'
		});
		expect(text).toContain('Chronos Error Log');
		expect(text).toContain(`Plugin: ${ERROR_LOG_PLUGIN_ID} v1.0.0`);
		expect(text).toContain('User-Agent: test-agent');
		expect(text).toContain('2026-09-14T12:00:00.000Z / error / TypeError / boom');
		expect(text).toContain('at main');
	});
});

describe('error-log plugin', () => {
	it('uses bundled plugin version from build injection', () => {
		expect(createErrorLogPlugin().version).toBe('1.0.0');
	});

	it('registers mine.item and screen slots when loaded', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(createErrorLogPlugin());

		const item = engine.slots.getSlotItem('mine.item', 'error-log');
		expect(item).toBeDefined();
		expect(item?.sectionId).toBe(ERROR_LOG_PLUGIN_ID);
		expect(engine.slots.getSlotItem('mine.section', ERROR_LOG_PLUGIN_ID)).toBeUndefined();
		expect(item?.href).toBe('/plugins/tool-error-log');
		expect(item?.icon).toBe('history');

		const screen = engine.slots.getSlotItem('shell.route.screen', ERROR_LOG_PLUGIN_ID);
		expect(screen).toBeDefined();

		handle.dispose();
		expect(engine.slots.getSlotItem('mine.item', 'error-log')).toBeUndefined();
		expect(engine.slots.getSlotItem('shell.route.screen', ERROR_LOG_PLUGIN_ID)).toBeUndefined();
		engine.dispose();
	});

	it('persists host-captured entries via runtime storage', async () => {
		const { env, errorCapture } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(createErrorLogPlugin());
		const ctx = engine.getPluginContext(ERROR_LOG_PLUGIN_ID);

		errorCapture.emitCaptured(
			createCapturedError('console', { message: 'persisted', id: 'e1', ts: 1 })
		);

		await vi.waitFor(async () => {
			const stored = await ctx.storage.get<unknown>(ERROR_LOG_STORAGE_KEY);
			expect(parseStoredEntries(stored)).toHaveLength(1);
		});

		handle.dispose();
		engine.dispose();
	});

	it('persists captured entries via runtime storage', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(createErrorLogPlugin());
		const ctx = engine.getPluginContext(ERROR_LOG_PLUGIN_ID);
		const runtime = createErrorLogRuntime(ctx);

		await runtime.append(createCapturedError('console', { message: 'persisted', id: 'e1', ts: 1 }));

		const stored = await ctx.storage.get<unknown>(ERROR_LOG_STORAGE_KEY);
		expect(parseStoredEntries(stored)).toHaveLength(1);

		handle.dispose();
		engine.dispose();
	});

	it('serializes concurrent append persistence so newer entries are not dropped', async () => {
		const writes: unknown[] = [];
		let releaseFirstWrite!: () => void;
		const firstWriteGate = new Promise<void>((resolve) => {
			releaseFirstWrite = resolve;
		});

		const { env } = createMockEnv({
			storage: {
				setPluginData: vi.fn(async (_pluginId: string, _key: string, value: unknown) => {
					writes.push(value);
					if (writes.length === 1) {
						await firstWriteGate;
					}
				}) as import('@chronos/core').ChronosEnv['storage']['setPluginData']
			}
		});
		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.loadPlugin(createErrorLogPlugin());
		const ctx = engine.getPluginContext(ERROR_LOG_PLUGIN_ID);
		const runtime = createErrorLogRuntime(ctx);

		const first = runtime.append(
			createCapturedError('console', { message: 'first', id: 'e1', ts: 1 })
		);
		const second = runtime.append(
			createCapturedError('console', { message: 'second', id: 'e2', ts: 2 })
		);

		releaseFirstWrite();
		await Promise.all([first, second]);

		expect(writes).toHaveLength(2);
		expect(parseStoredEntries(writes.at(-1)).map((entry) => entry.message)).toEqual([
			'first',
			'second'
		]);

		engine.dispose();
	});
});
