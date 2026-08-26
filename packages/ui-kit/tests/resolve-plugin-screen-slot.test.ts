import { describe, expect, it } from 'vite-plus/test';
import type { PluginScreenSlotContribution } from '@chronos/core';
import { resolvePluginScreenSlot } from '../src/plugin-screen/resolve-plugin-screen-slot';

const screen: PluginScreenSlotContribution = {
	id: 'tool-wallpaper',
	title: () => '设置课表壁纸'
};

describe('resolvePluginScreenSlot', () => {
	it('matches slot id equal to plugin id when view is index', () => {
		expect(resolvePluginScreenSlot([screen], 'tool-wallpaper', 'index')).toBe(screen);
	});

	it('matches slot id equal to view id', () => {
		expect(resolvePluginScreenSlot([screen], 'tool-wallpaper', 'tool-wallpaper')).toBe(screen);
	});

	it('matches composite pluginId/view id', () => {
		const composite: PluginScreenSlotContribution = {
			id: 'tool-wallpaper/custom',
			title: () => 'Custom'
		};
		expect(resolvePluginScreenSlot([composite], 'tool-wallpaper', 'custom')).toBe(composite);
	});

	it('returns undefined when no slot matches', () => {
		expect(resolvePluginScreenSlot([screen], 'other-plugin', 'index')).toBeUndefined();
	});
});
