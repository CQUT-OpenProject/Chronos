import { describe, it, expect, vi } from 'vite-plus/test';
import {
	HierarchicalSlotRegistry,
	type ImportTabSlotContribution,
	type MineItemSlotContribution
} from '../src';

describe('HierarchicalSlotRegistry in @chronos/core', () => {
	it('registers, sorts by order, and retrieves slot contributions', () => {
		const registry = new HierarchicalSlotRegistry();

		const tab1: ImportTabSlotContribution = {
			id: 'source-cqut',
			title: '知行理工',
			order: 20,
			executeImport: vi.fn()
		};

		const tab2: ImportTabSlotContribution = {
			id: 'source-html',
			title: 'HTML 文件导入',
			order: 10,
			executeImport: vi.fn()
		};

		const tab3: ImportTabSlotContribution = {
			id: 'source-share',
			title: '分享口令导入',
			// order defaults to 50
			executeImport: vi.fn()
		};

		registry.register('import.source.tab', tab1, 'plugin-cqut');
		registry.register('import.source.tab', tab2, 'plugin-html');
		registry.register('import.source.tab', tab3, 'plugin-share');

		const allTabs = registry.get('import.source.tab');
		expect(allTabs.map((t) => t.id)).toEqual(['source-html', 'source-cqut', 'source-share']);

		const singleItem = registry.getSlotItem('import.source.tab', 'source-cqut');
		expect(singleItem).toBe(tab1);

		expect(registry.resolveOwner('import.source.tab', 'source-cqut')).toBe('plugin-cqut');
		expect(registry.resolveOwner('import.source.tab', 'source-html')).toBe('plugin-html');
		expect(registry.resolveOwner('import.source.tab', 'missing')).toBeUndefined();
	});

	it('triggers change listener and supports dynamic disposal', () => {
		const onChanged = vi.fn();
		const registry = new HierarchicalSlotRegistry(onChanged);
		const listener = vi.fn();

		const listenerSub = registry.onChanged(listener);

		const item: MineItemSlotContribution = {
			id: 'settings-item',
			sectionId: 'system',
			title: '设置'
		};

		const regSub = registry.register('mine.item', item);
		expect(onChanged).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledTimes(1);
		expect(registry.get('mine.item')).toHaveLength(1);

		regSub.dispose();
		expect(onChanged).toHaveBeenCalledTimes(2);
		expect(listener).toHaveBeenCalledTimes(2);
		expect(registry.get('mine.item')).toHaveLength(0);

		listenerSub.dispose();
		registry.register('mine.item', item);
		expect(listener).toHaveBeenCalledTimes(2); // no additional call after unsubscribe
	});

	it('clears all slots and listeners on dispose', () => {
		const registry = new HierarchicalSlotRegistry();
		registry.register('mine.item', {
			id: 'item-1',
			sectionId: 'sec-1',
			title: 'Item 1'
		});

		registry.dispose();
		expect(registry.get('mine.item')).toHaveLength(0);
	});

	it('warns when a slot contribution id is overwritten by another owner', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const registry = new HierarchicalSlotRegistry();

		registry.register(
			'import.source.tab',
			{ id: 'share-link', title: 'A', executeImport: vi.fn() },
			'plugin-a'
		);
		registry.register(
			'import.source.tab',
			{ id: 'share-link', title: 'B', executeImport: vi.fn() },
			'plugin-b'
		);

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('import.source.tab/share-link'));
		expect(registry.resolveOwner('import.source.tab', 'share-link')).toBe('plugin-b');
		warn.mockRestore();
	});
});
