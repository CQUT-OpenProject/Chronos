import type { ChronosPlugin } from '@chronos/core';

function isChronosPlugin(value: unknown): value is ChronosPlugin {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as ChronosPlugin;
	return typeof candidate.id === 'string' && typeof candidate.apply === 'function';
}

function resolvePluginExport(mod: Record<string, unknown>): ChronosPlugin | null {
	const candidate =
		(mod.default as ChronosPlugin) ??
		(mod.plugin as ChronosPlugin) ??
		(isChronosPlugin(mod) ? (mod as unknown as ChronosPlugin) : null);
	if (isChronosPlugin(candidate)) return candidate;
	if (mod.default && typeof mod.default === 'object') {
		const nested = (mod.default as Record<string, unknown>).default as ChronosPlugin;
		if (isChronosPlugin(nested)) return nested;
	}
	return null;
}

function parseCjsBundle(code: string): ChronosPlugin | null {
	try {
		// eslint-disable-next-line no-new-func
		const moduleObj = { exports: {} as Record<string, unknown> };
		// eslint-disable-next-line no-new-func
		const fn = new Function('module', 'exports', code);
		fn(moduleObj, moduleObj.exports);
		const candidate =
			(moduleObj.exports.default as ChronosPlugin) ??
			(moduleObj.exports.plugin as ChronosPlugin) ??
			(isChronosPlugin(moduleObj.exports) ? (moduleObj.exports as unknown as ChronosPlugin) : null);
		if (candidate && isChronosPlugin(candidate)) return candidate;
	} catch {
		// ignore, try ESM path
	}
	return null;
}

function isLikelyCjs(code: string): boolean {
	return /\bmodule\.exports\b|\bexports\./.test(code);
}

/** Load an ESM bundle from verified source code via blob import. Falls back to CJS eval for Node tests. */
export async function loadEsmPluginFromCode(code: string): Promise<ChronosPlugin> {
	// Fast path: CJS bundles (used in unit tests)
	if (isLikelyCjs(code)) {
		const cjs = parseCjsBundle(code);
		if (cjs) return cjs;
	}
	// Browser: try blob import for true ESM (with imports, svelte runtime, etc.)
	if (
		typeof Blob !== 'undefined' &&
		typeof URL !== 'undefined' &&
		typeof URL.createObjectURL === 'function'
	) {
		try {
			const blob = new Blob([code], { type: 'text/javascript' });
			const url = URL.createObjectURL(blob);
			try {
				const mod = (await import(/* @vite-ignore */ url)) as Record<string, unknown>;
				const plugin = resolvePluginExport(mod);
				if (plugin) return plugin;
			} finally {
				URL.revokeObjectURL(url);
			}
		} catch {
			// fall through to transform fallback
		}
	}
	// Fallback: transform ESM `export default` to CJS and eval (covers Node tests for simple ESM)
	try {
		const transformed = code
			.replace(/^\s*export\s+default\s+/m, 'module.exports.default = ')
			.replace(/^\s*export\s+const\s+(\w+)\s*=/gm, 'module.exports.$1 =');
		const cjs = parseCjsBundle(transformed);
		if (cjs) return cjs;
	} catch {}
	throw new Error('Invalid plugin bundle: missing id or apply()');
}

/** Synchronous CJS parser for unit tests (legacy IIFE bundles). */
export function parsePluginBundle(code: string): ChronosPlugin {
	const cjs = parseCjsBundle(code);
	if (cjs) return cjs;
	// For simple ESM `export default { ... }` in tests, transform and eval synchronously
	if (/export\s+default/.test(code)) {
		const transformed = code.replace(/^\s*export\s+default\s+/m, 'module.exports.default = ');
		const fallback = parseCjsBundle(transformed);
		if (fallback) return fallback;
	}
	throw new Error('Invalid plugin bundle: missing id or apply()');
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
	if (m.bundleFormat && m.bundleFormat !== 'esm' && m.bundleFormat !== 'iife') {
		throw new Error('Invalid plugin manifest: bundleFormat must be esm');
	}
}
