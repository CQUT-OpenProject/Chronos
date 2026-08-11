import { describe, expect, it } from 'vite-plus/test';
import { normalizeReleaseTag } from './release';

describe('normalizeReleaseTag', () => {
	it('prefixes bare versions with v', () => {
		expect(normalizeReleaseTag('1.0.0')).toBe('v1.0.0');
	});

	it('normalizes uppercase V prefix', () => {
		expect(normalizeReleaseTag('V1.0.0')).toBe('v1.0.0');
	});

	it('keeps lowercase v prefix', () => {
		expect(normalizeReleaseTag('v1.0.0')).toBe('v1.0.0');
	});

	it('returns v0.0.0 for empty input', () => {
		expect(normalizeReleaseTag('')).toBe('v0.0.0');
		expect(normalizeReleaseTag('   ')).toBe('v0.0.0');
	});
});
