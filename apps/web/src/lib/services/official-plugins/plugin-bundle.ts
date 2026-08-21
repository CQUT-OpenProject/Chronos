/* eslint-disable @typescript-eslint/no-implied-eval, no-new-func */
import type { ChronosPlugin } from '@chronos/core';

function isChronosPlugin(value: unknown): value is ChronosPlugin {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as ChronosPlugin;
	return typeof candidate.id === 'string' && typeof candidate.apply === 'function';
}

/** Parse an IIFE bundle that exports a ChronosPlugin via module.exports. */
export function parsePluginBundle(code: string): ChronosPlugin {
	const moduleObj = { exports: {} as Record<string, unknown> };
	const fn = new Function('module', 'exports', code);
	fn(moduleObj, moduleObj.exports);

	const plugin =
		moduleObj.exports.default ??
		moduleObj.exports.plugin ??
		(isChronosPlugin(moduleObj.exports) ? moduleObj.exports : null);

	if (!isChronosPlugin(plugin)) {
		throw new Error('Invalid plugin bundle: missing id or apply()');
	}

	return plugin;
}

export function validatePluginManifest(
	manifest: unknown
): asserts manifest is import('@chronos/core').PluginManifest {
	if (!manifest || typeof manifest !== 'object') {
		throw new Error('Invalid plugin manifest');
	}
	const m = manifest as Record<string, unknown>;
	if (typeof m.id !== 'string' || !m.id) {
		throw new Error('Invalid plugin manifest: missing id');
	}
	if (typeof m.version !== 'string' || !m.version) {
		throw new Error('Invalid plugin manifest: missing version');
	}
	if (typeof m.bundleUrl !== 'string' || !m.bundleUrl) {
		throw new Error('Invalid plugin manifest: missing bundleUrl');
	}
	if (typeof m.sha256 !== 'string' || !m.sha256) {
		throw new Error('Invalid plugin manifest: missing sha256');
	}
}
