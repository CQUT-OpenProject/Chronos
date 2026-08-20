import { describe, it, expect } from 'vite-plus/test';
import {
	SchemaForm,
	PluginScreenContainer,
	SlotOutlet,
	ReactiveChronosController,
	m3DefaultTheme
} from '../src/index';

describe('ui-kit exports', () => {
	it('exports Svelte components and utilities', () => {
		expect(SchemaForm).toBeDefined();
		expect(PluginScreenContainer).toBeDefined();
		expect(SlotOutlet).toBeDefined();
		expect(ReactiveChronosController).toBeDefined();
		expect(m3DefaultTheme).toBeDefined();
	});
});
