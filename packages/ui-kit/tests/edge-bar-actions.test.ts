import { describe, expect, it } from 'vitest';
import {
	createEdgeBarActions,
	type EdgeBarAction
} from '../src/plugin-screen/edge-bar-actions.svelte';

const action: EdgeBarAction = {
	id: 'save',
	label: 'Save',
	icon: 'check',
	onClick: () => {}
};

describe('edge bar action registration', () => {
	it('keeps mounted plugin actions isolated and clears only their owner', () => {
		const registry = createEdgeBarActions();
		const clearClock = registry.register('clock', [action]);
		const clearWallpaper = registry.register('wallpaper', [{ ...action, id: 'pick' }]);

		expect(registry.get('clock')).toHaveLength(1);
		expect(registry.get('wallpaper')[0]?.id).toBe('pick');
		clearClock();
		expect(registry.get('clock')).toEqual([]);
		expect(registry.get('wallpaper')).toHaveLength(1);
		clearWallpaper();
	});

	it('does not let an old wallpaper view clear its replacement', () => {
		const registry = createEdgeBarActions();
		const clearMain = registry.register('wallpaper', [{ ...action, id: 'pick' }]);
		const clearCrop = registry.register('wallpaper', [{ ...action, id: 'confirm' }]);

		clearMain();
		expect(registry.get('wallpaper')[0]?.id).toBe('confirm');
		clearCrop();
		expect(registry.get('wallpaper')).toEqual([]);
	});
});
