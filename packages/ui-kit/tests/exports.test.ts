import { describe, it, expect } from 'vite-plus/test';
import {
	SchemaForm,
	PluginScreenContainer,
	MountableSlotOutlet,
	ReactiveChronosController,
	m3DefaultTheme,
	PREVIEW_PAINT_READY_CONTEXT
} from '../src/index';

describe('ui-kit exports', () => {
	it('exports Svelte components and utilities', () => {
		expect(SchemaForm).toBeDefined();
		expect(PluginScreenContainer).toBeDefined();
		expect(MountableSlotOutlet).toBeDefined();
		expect(ReactiveChronosController).toBeDefined();
		expect(m3DefaultTheme).toBeDefined();
		expect(PREVIEW_PAINT_READY_CONTEXT).toBe('chronos.previewPaintReady');
	});
});
