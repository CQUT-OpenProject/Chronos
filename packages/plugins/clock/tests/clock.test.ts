import { describe, it, expect } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import { createMockEnv } from '@chronos/core/test-utils';
import { combineLocalDateTime, parseStoredFrozenEpoch } from '../src/clock';
import { CLOCK_PLUGIN_ID, CLOCK_STORAGE_KEY } from '../src/constants';
import { createClockPlugin } from '../src/index';

describe('clock helpers', () => {
	it('combines a local ISO date with hour and minute', () => {
		const next = combineLocalDateTime('2026-03-02', { hour: 9, minute: 15 });
		expect(next).toEqual(new Date(2026, 2, 2, 9, 15, 0, 0));
	});

	it('rejects invalid date or time parts', () => {
		expect(combineLocalDateTime('2026-13-01', { hour: 9, minute: 0 })).toBeNull();
		expect(combineLocalDateTime('2026-03-02', { hour: 24, minute: 0 })).toBeNull();
		expect(combineLocalDateTime('2026-03-02', { hour: 9, minute: 60 })).toBeNull();
		expect(combineLocalDateTime('nope', { hour: 9, minute: 15 })).toBeNull();
	});

	it('parses stored freeze epoch values', () => {
		expect(parseStoredFrozenEpoch(1_741_000_000_000)).toBe(1_741_000_000_000);
		expect(parseStoredFrozenEpoch('1741000000000')).toBeNull();
		expect(parseStoredFrozenEpoch(Number.NaN)).toBeNull();
		expect(parseStoredFrozenEpoch(null)).toBeNull();
	});
});

describe('clock plugin', () => {
	it('registers mine.item and screen slots when loaded', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(createClockPlugin());

		const item = engine.slots.getSlotItem('mine.item', 'clock');
		expect(item).toBeDefined();
		expect(item?.sectionId).toBe(CLOCK_PLUGIN_ID);
		expect(item?.href).toBe(`/plugins/${CLOCK_PLUGIN_ID}`);
		expect(item?.icon).toBe('schedule');
		expect(typeof item?.title === 'function' ? item.title() : item?.title).toBe('自定义时间');

		const screen = engine.slots.getSlotItem('shell.route.screen', CLOCK_PLUGIN_ID);
		expect(screen).toBeDefined();
		expect(typeof screen?.title === 'function' ? screen.title() : screen?.title).toBe('自定义时间');

		handle.dispose();
		expect(engine.slots.getSlotItem('mine.item', 'clock')).toBeUndefined();
		expect(engine.slots.getSlotItem('shell.route.screen', CLOCK_PLUGIN_ID)).toBeUndefined();
		engine.dispose();
	});

	it('restores a frozen clock from plugin storage and clears it on unload', async () => {
		const { env } = createMockEnv();
		const frozenNow = new Date(2026, 2, 2, 9, 15, 0);
		await env.storage.setPluginData(CLOCK_PLUGIN_ID, CLOCK_STORAGE_KEY, frozenNow.getTime());

		const engine = new ChronosEngine({ env });
		await engine.init();
		const handle = await engine.loadPlugin(createClockPlugin());

		expect(engine.state.clockFrozen).toBe(true);
		expect(engine.now().getTime()).toBe(frozenNow.getTime());
		expect(engine.state.todayIso).toBe('2026-03-02');

		handle.dispose();
		expect(engine.state.clockFrozen).toBe(false);
		expect(await env.storage.getPluginData(CLOCK_PLUGIN_ID, CLOCK_STORAGE_KEY)).toBe(
			frozenNow.getTime()
		);

		const reload = await engine.loadPlugin(createClockPlugin());
		expect(engine.state.clockFrozen).toBe(true);
		expect(engine.now().getTime()).toBe(frozenNow.getTime());
		reload.dispose();
		engine.dispose();
	});
});
