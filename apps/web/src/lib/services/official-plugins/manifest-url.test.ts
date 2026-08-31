import { describe, expect, it } from 'vite-plus/test';
import type { PluginManifest } from '@chronos/core';
import {
	assertValidManifestInstallUrl,
	resolveManifestAssetUrl,
	resolveManifestForDownload
} from './manifest-url';

describe('assertValidManifestInstallUrl', () => {
	it('accepts http and https URLs', () => {
		expect(() =>
			assertValidManifestInstallUrl('https://example.com/plugin.manifest.json')
		).not.toThrow();
		expect(() =>
			assertValidManifestInstallUrl('http://example.com/plugin.manifest.json')
		).not.toThrow();
	});

	it('rejects empty, invalid, and non-http(s) URLs', () => {
		expect(() => assertValidManifestInstallUrl('')).toThrow(/required/i);
		expect(() => assertValidManifestInstallUrl('not-a-url')).toThrow(/Invalid manifest URL/);
		expect(() => assertValidManifestInstallUrl('javascript:alert(1)')).toThrow(/http or https/);
		expect(() => assertValidManifestInstallUrl('file:///tmp/manifest.json')).toThrow(
			/http or https/
		);
	});
});

describe('resolveManifestAssetUrl', () => {
	const manifestUrl = 'https://cdn.example.com/plugins/foo/manifest.json';

	it('returns absolute http(s) URLs unchanged', () => {
		expect(resolveManifestAssetUrl(manifestUrl, 'https://other.example/bundle.js')).toBe(
			'https://other.example/bundle.js'
		);
	});

	it('resolves root-relative paths against manifest origin', () => {
		expect(resolveManifestAssetUrl(manifestUrl, '/official-plugins/bundle.js')).toBe(
			'https://cdn.example.com/official-plugins/bundle.js'
		);
	});

	it('resolves directory-relative paths against manifest directory', () => {
		expect(resolveManifestAssetUrl(manifestUrl, 'bundle.js')).toBe(
			'https://cdn.example.com/plugins/foo/bundle.js'
		);
	});
});

describe('resolveManifestForDownload', () => {
	const baseManifest: PluginManifest = {
		id: 'test',
		name: { 'zh-CN': 'Test' },
		version: '1.0.0',
		description: { 'zh-CN': 'Test' },
		author: 'Chronos',
		type: 'tool',
		bundleFormat: 'esm',
		bundleUrl: 'bundle.js',
		sha256: 'abc',
		cssUrl: '/styles/bundle.css',
		cssSha256: 'def'
	};

	it('returns manifest unchanged when manifestUrl is absent', () => {
		expect(resolveManifestForDownload(baseManifest)).toEqual(baseManifest);
	});

	it('resolves asset URLs when manifestUrl is provided', () => {
		const resolved = resolveManifestForDownload(
			baseManifest,
			'https://cdn.example.com/plugins/foo/manifest.json'
		);
		expect(resolved.bundleUrl).toBe('https://cdn.example.com/plugins/foo/bundle.js');
		expect(resolved.cssUrl).toBe('https://cdn.example.com/styles/bundle.css');
	});
});
