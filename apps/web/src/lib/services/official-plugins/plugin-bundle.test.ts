import { describe, expect, it } from 'vite-plus/test';
import { CHRONOS_ENGINE_VERSION } from '@chronos/core';
import {
	assertEngineVersionCompatible,
	comparePluginVersions,
	isEngineVersionCompatible,
	isPluginVersionNewer,
	validatePluginManifest
} from '$lib/services/official-plugins/plugin-bundle';
import type { PluginManifest } from '@chronos/core';

const BASE_MANIFEST: PluginManifest = {
	id: 'test-plugin',
	name: { 'zh-CN': 'Test' },
	version: '1.0.0',
	description: { 'zh-CN': 'Test' },
	author: 'Chronos',
	type: 'tool',
	bundleFormat: 'esm',
	minEngineVersion: '0.3.0',
	bundleUrl: '/test.bundle.js',
	sha256: 'abc'
};

describe('plugin version comparison', () => {
	it('compares semver tuples', () => {
		expect(comparePluginVersions('1.0.0', '1.0.0')).toBe(0);
		expect(comparePluginVersions('2.0.0', '1.9.9')).toBeGreaterThan(0);
		expect(comparePluginVersions('1.0.1', '1.0.0')).toBeGreaterThan(0);
		expect(comparePluginVersions('0.9.0', '1.0.0')).toBeLessThan(0);
	});

	it('detects newer remote versions', () => {
		expect(isPluginVersionNewer('2.0.0', '1.0.0')).toBe(true);
		expect(isPluginVersionNewer('1.0.0', '1.0.0')).toBe(false);
		expect(isPluginVersionNewer('1.0.0', '2.0.0')).toBe(false);
	});
});

describe('plugin engine version compatibility', () => {
	it('compares semver tuples', () => {
		expect(isEngineVersionCompatible('0.4.0', '0.3.0')).toBe(true);
		expect(isEngineVersionCompatible('0.4.0', '0.4.0')).toBe(true);
		expect(isEngineVersionCompatible('0.3.9', '0.4.0')).toBe(false);
		expect(isEngineVersionCompatible(CHRONOS_ENGINE_VERSION, '0.4.0')).toBe(true);
	});

	it('validatePluginManifest rejects incompatible minEngineVersion', () => {
		expect(() => validatePluginManifest({ ...BASE_MANIFEST, minEngineVersion: '99.0.0' })).toThrow(
			/requires engine >= 99\.0\.0/
		);
	});

	it('assertEngineVersionCompatible passes for supported manifests', () => {
		expect(() => assertEngineVersionCompatible(BASE_MANIFEST)).not.toThrow();
	});
});
