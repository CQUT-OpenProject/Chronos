import { describe, it, expect } from 'vite-plus/test';
import { defineSchema, extractDefaultValues, validateConfig, type ConfigSchema } from '../src';

describe('ConfigSchema & Validator in @chronos/core', () => {
	interface TestConfig {
		username: string;
		campus: 'huaxi' | 'liangjiang';
		autoSync: boolean;
		syncInterval: number;
		customUrl?: string;
	}

	const testSchema: ConfigSchema<TestConfig> = defineSchema<TestConfig>({
		username: {
			type: 'string',
			title: 'Username',
			required: true,
			default: ''
		},
		campus: {
			type: 'select',
			title: 'Campus',
			default: 'huaxi',
			options: [
				{ label: 'Huaxi', value: 'huaxi' },
				{ label: 'Liangjiang', value: 'liangjiang' }
			]
		},
		autoSync: {
			type: 'boolean',
			title: 'Auto Sync',
			default: true
		},
		syncInterval: {
			type: 'number',
			title: 'Sync Interval',
			default: 30,
			validate: (val) => (val < 5 ? 'Interval must be at least 5 minutes' : null)
		},
		customUrl: {
			type: 'string',
			title: 'Custom URL',
			required: false
		}
	});

	it('extracts default values from schema', () => {
		const defaults = extractDefaultValues(testSchema);
		expect(defaults).toEqual({
			username: '',
			campus: 'huaxi',
			autoSync: true,
			syncInterval: 30,
			customUrl: ''
		});
	});

	it('validates valid input correctly', () => {
		const input = {
			username: '12023001',
			campus: 'liangjiang',
			autoSync: false,
			syncInterval: 15
		};

		const result = validateConfig(input, testSchema);
		expect(result.valid).toBe(true);
		expect(result.errors).toEqual({});
		expect(result.values.username).toBe('12023001');
		expect(result.values.campus).toBe('liangjiang');
		expect(result.values.autoSync).toBe(false);
		expect(result.values.syncInterval).toBe(15);
	});

	it('reports errors for missing required fields and invalid values', () => {
		const invalidInput = {
			username: '', // required but empty
			campus: 'invalid_campus', // not in select options
			syncInterval: 2 // triggers custom validation (< 5)
		};

		const result = validateConfig(invalidInput, testSchema);
		expect(result.valid).toBe(false);
		expect(result.errors.username).toBe('Field is required');
		expect(result.errors.campus).toBe('Selected option is not in the allowed list');
		expect(result.errors.syncInterval).toBe('Interval must be at least 5 minutes');
	});
});
