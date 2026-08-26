import { describe, it, expect } from 'vite-plus/test';
import {
	defineSchema,
	validateConfig,
	type ChronosPlugin,
	HierarchicalSlotRegistry
} from '../src/index';

describe('Plugin Metadata & Schema Validation', () => {
	it('validates config schema and fills default values', () => {
		interface DemoConfig {
			name: string;
			timeout: number;
			enabled: boolean;
			mode?: string;
		}

		const schema = defineSchema<DemoConfig>({
			name: {
				type: 'string',
				title: () => 'Name',
				required: true,
				validate: (val) => (val.length < 3 ? 'Name must be at least 3 chars' : null)
			},
			timeout: {
				type: 'number',
				title: () => 'Timeout',
				default: 5000
			},
			enabled: {
				type: 'boolean',
				title: () => 'Enabled',
				default: true
			},
			mode: {
				type: 'select',
				title: () => 'Mode',
				default: 'auto',
				options: [
					{ label: 'Auto', value: 'auto' },
					{ label: 'Manual', value: 'manual' }
				]
			}
		});

		// 1. Valid input with defaults applied
		const res1 = validateConfig({ name: 'Chronos' }, schema);
		expect(res1.valid).toBe(true);
		expect(res1.values.name).toBe('Chronos');
		expect(res1.values.timeout).toBe(5000);
		expect(res1.values.enabled).toBe(true);
		expect(res1.values.mode).toBe('auto');

		// 2. Invalid input (missing required field)
		const res2 = validateConfig({}, schema);
		expect(res2.valid).toBe(false);
		expect(res2.errors.name).toBe('Field is required');

		// 3. Custom validator failure
		const res3 = validateConfig({ name: 'ab' }, schema);
		expect(res3.valid).toBe(false);
		expect(res3.errors.name).toBe('Name must be at least 3 chars');
	});

	it('supports ordering and metadata on ChronosPlugin definitions', () => {
		const pluginA: ChronosPlugin = {
			id: 'plugin-a',
			name: 'Plugin A',
			version: '1.0.0',
			description: 'First plugin',
			category: 'source',
			order: 20,
			author: 'Test Author',
			apply: () => {}
		};

		const pluginB: ChronosPlugin = {
			id: 'plugin-b',
			name: 'Plugin B',
			version: '1.0.0',
			description: 'Second plugin',
			category: 'parser',
			order: 10,
			apply: () => {}
		};

		const pluginList = [pluginA, pluginB];
		const sorted = [...pluginList].sort((a, b) => (a.order ?? 50) - (b.order ?? 50));

		expect(sorted[0].id).toBe('plugin-b');
		expect(sorted[1].id).toBe('plugin-a');
		expect(sorted[0].category).toBe('parser');
		expect(sorted[1].author).toBe('Test Author');
	});

	it('supports custom slots in HierarchicalSlotRegistry', () => {
		const registry = new HierarchicalSlotRegistry();
		const customContribution = {
			id: 'custom-widget-1',
			title: 'Custom Widget',
			order: 5
		};

		const disposable = registry.register('custom.widget' as any, customContribution as any);
		const items = registry.get('custom.widget' as any);

		expect(items.length).toBe(1);
		expect((items[0] as any).title).toBe('Custom Widget');

		disposable.dispose();
		expect(registry.get('custom.widget' as any).length).toBe(0);
	});
});
