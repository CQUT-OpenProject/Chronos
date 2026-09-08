import { describe, expect, it } from 'vite-plus/test';
import {
	designTokensToWorkbenchColors,
	validateWorkbenchColors
} from '../src/theme/workbench-colors';

describe('workbench-colors', () => {
	it('validateWorkbenchColors warns on unknown keys and accepts standard keys', () => {
		const result = validateWorkbenchColors({
			'color.on-surface': '#2e333a',
			'color.unknown-custom': '#2288dd'
		});
		expect(result.errors).toEqual([]);
		expect(result.colors['color.on-surface']).toBe('#2e333a');
		expect(result.warnings.some((w) => w.includes('unknown key'))).toBe(true);
	});

	it('validateWorkbenchColors rejects unsafe values', () => {
		const result = validateWorkbenchColors({
			'color.primary': '<script>alert(1)</script>'
		});
		expect(result.errors.length).toBe(1);
		expect(result.colors).toEqual({});
	});

	it('designTokensToWorkbenchColors emits hyphenated workbench keys', () => {
		const colors = designTokensToWorkbenchColors({
			onSurface: '#2e333a',
			surfaceVariant: '#f1f5f9',
			primary: '#2288dd'
		});
		expect(colors).toEqual({
			'color.on-surface': '#2e333a',
			'color.surface-variant': '#f1f5f9',
			'color.primary': '#2288dd'
		});
	});

	it('validateWorkbenchColors accepts host semantic keys', () => {
		const result = validateWorkbenchColors({
			'color.canvas': '#f0f4f8',
			'color.ink': '#0b1f33',
			'color.border-subtle': '#d4e0eb',
			'color.success': '#15803d',
			'color.warning': '#b45309',
			'color.danger': '#e60012',
			'color.outline-variant': '#e2e8f0',
			'color.surface-container-high': '#f1f5f9'
		});
		expect(result.errors).toEqual([]);
		expect(result.colors['color.canvas']).toBe('#f0f4f8');
		expect(result.colors['color.danger']).toBe('#e60012');
	});
});
