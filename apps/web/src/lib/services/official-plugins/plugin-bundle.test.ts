import { describe, expect, it } from 'vite-plus/test';
import { validatePluginManifest } from '$lib/services/official-plugins/plugin-bundle';
import type { PluginManifest } from '@chronos/core';

const BASE_MANIFEST: PluginManifest = {
	id: 'test-plugin',
	name: { 'zh-CN': 'Test' },
	version: '1.0.0',
	description: { 'zh-CN': 'Test' },
	author: 'Chronos',
	type: 'tool',
	bundleFormat: 'esm',
	bundleUrl: '/test.bundle.js',
	sha256: 'abc'
};

describe('validatePluginManifest', () => {
	it('accepts a valid bundle manifest', () => {
		expect(() => validatePluginManifest(BASE_MANIFEST)).not.toThrow();
	});

	it('rejects missing id', () => {
		expect(() => validatePluginManifest({ ...BASE_MANIFEST, id: '' })).toThrow(/missing id/);
	});

	it('rejects missing sha256 for bundleUrl', () => {
		expect(() => validatePluginManifest({ ...BASE_MANIFEST, sha256: '' })).toThrow(
			/missing sha256/
		);
	});

	it('rejects cssUrl without cssSha256', () => {
		expect(() => validatePluginManifest({ ...BASE_MANIFEST, cssUrl: '/test.bundle.css' })).toThrow(
			/missing cssSha256/
		);
	});

	it('accepts cssUrl with cssSha256', () => {
		expect(() =>
			validatePluginManifest({
				...BASE_MANIFEST,
				cssUrl: '/test.bundle.css',
				cssSha256: 'def'
			})
		).not.toThrow();
	});
});
