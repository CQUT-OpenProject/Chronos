import { describe, expect, it } from 'vite-plus/test';
import {
	compareReleaseVersions,
	normalizeReleaseTag,
	parseFrontmatter,
	parseReleaseVersion
} from './release';

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

describe('parseReleaseVersion', () => {
	it('parses tagged and bare xyz versions', () => {
		expect(parseReleaseVersion('v0.1.3')).toEqual([0, 1, 3]);
		expect(parseReleaseVersion('1.2.10')).toEqual([1, 2, 10]);
	});
});

describe('compareReleaseVersions', () => {
	it('compares xyz numerically, not as strings', () => {
		expect(compareReleaseVersions('v0.1.2', 'v0.1.3')).toBeLessThan(0);
		expect(compareReleaseVersions('v0.1.10', 'v0.1.9')).toBeGreaterThan(0);
		expect(compareReleaseVersions('v1.0.0', 'v0.9.9')).toBeGreaterThan(0);
		expect(compareReleaseVersions('v0.1.3', '0.1.3')).toBe(0);
	});
});

describe('parseFrontmatter', () => {
	it('parses frontmatter and body properly', () => {
		const raw = `---
name: Chronos 0.2.0
publishedAt: 2026-08-18
---

- 更新内容`;
		const result = parseFrontmatter(raw);
		expect(result.name).toBe('Chronos 0.2.0');
		expect(result.publishedAt).toBe('2026-08-18');
		expect(result.body).toBe('- 更新内容');
	});

	it('returns trimmed body when frontmatter is missing', () => {
		const result = parseFrontmatter('纯正文文本');
		expect(result.name).toBeUndefined();
		expect(result.body).toBe('纯正文文本');
	});
});
