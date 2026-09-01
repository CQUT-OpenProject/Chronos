import { describe, expect, it, beforeEach } from 'vite-plus/test';
import { ChronosEngine, type ChronosContext } from '@chronos/core';
import { createMockEnv } from '@chronos/core/test-utils';
import { ReactiveChronosController } from '@chronos/ui-kit';
import { createShellTabController } from './shell-tab.svelte';

function registerCoreTabs(ctx: ChronosContext): void {
	ctx.registerSlot('shell.bottom-bar.tab', {
		id: 'timetable',
		label: () => 'Timetable',
		order: 10
	});
	ctx.registerSlot('shell.bottom-bar.tab', {
		id: 'mine',
		label: () => 'Mine',
		order: 20
	});
}

function createTodayTabPlugin() {
	return {
		id: 'tool-today',
		name: 'Today',
		version: '1.0.0',
		apply(ctx: ChronosContext) {
			ctx.registerSlot('shell.bottom-bar.tab', {
				id: 'today',
				label: () => 'Today',
				order: 15,
				defaultLaunch: true
			});
		}
	};
}

describe('createShellTabController', () => {
	let engine: ChronosEngine;
	let controller: ReactiveChronosController;

	beforeEach(async () => {
		const { env } = createMockEnv();
		engine = new ChronosEngine({ env });
		await engine.init();
		controller = new ReactiveChronosController(engine);
		await engine.loadPlugin({
			id: 'core-shell',
			name: 'Core Shell',
			version: '1.0.0',
			apply: registerCoreTabs
		});
	});

	it('defaults to timetable when no tab declares defaultLaunch', () => {
		const shellTab = createShellTabController(() => controller);
		shellTab.init();
		expect(shellTab.activeTabId).toBe('timetable');
	});

	it('uses defaultLaunch tab as the initial active tab', async () => {
		const todayHandle = await engine.loadPlugin(createTodayTabPlugin());
		const shellTab = createShellTabController(() => controller);
		shellTab.init();
		expect(shellTab.activeTabId).toBe('today');
		todayHandle.dispose();
	});

	it('falls back when the active plugin tab is unloaded', async () => {
		const todayHandle = await engine.loadPlugin(createTodayTabPlugin());
		const shellTab = createShellTabController(() => controller);
		shellTab.init();
		expect(shellTab.activeTabId).toBe('today');

		todayHandle.dispose();
		shellTab.reconcileActiveTab();
		expect(shellTab.activeTabId).toBe('timetable');
	});

	it('updates active tab via setActiveTab', () => {
		const shellTab = createShellTabController(() => controller);
		shellTab.init();
		shellTab.setActiveTab('mine');
		expect(shellTab.activeTabId).toBe('mine');
	});

	it('does not reset active tab when init is called again', () => {
		const shellTab = createShellTabController(() => controller);
		shellTab.init();
		shellTab.setActiveTab('mine');
		shellTab.init();
		expect(shellTab.activeTabId).toBe('mine');
	});

	it('applies deferred defaultLaunch when the tab registers after init', async () => {
		const shellTab = createShellTabController(() => controller);
		shellTab.init();
		expect(shellTab.activeTabId).toBe('timetable');

		const todayHandle = await engine.loadPlugin(createTodayTabPlugin());
		shellTab.reconcileActiveTab();
		expect(shellTab.activeTabId).toBe('today');
		todayHandle.dispose();
	});

	it('does not override a user-selected tab when deferred defaultLaunch appears', async () => {
		const shellTab = createShellTabController(() => controller);
		shellTab.init();
		shellTab.setActiveTab('mine');

		const todayHandle = await engine.loadPlugin(createTodayTabPlugin());
		shellTab.reconcileActiveTab();
		expect(shellTab.activeTabId).toBe('mine');
		todayHandle.dispose();
	});
});
