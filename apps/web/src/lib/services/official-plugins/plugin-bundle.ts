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

/** Load an ESM bundle from verified source code via blob/data dynamic import. */
export async function loadEsmPluginFromCode(code: string): Promise<ChronosPlugin> {
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
			// fall through to data URL
		}
	}

	// Node / Testing environment: native data URL dynamic import
	if (typeof Buffer !== 'undefined') {
		try {
			const base64 = Buffer.from(code, 'utf-8').toString('base64');
			const dataUrl = `data:text/javascript;base64,${base64}`;
			const mod = (await import(/* @vite-ignore */ dataUrl)) as Record<string, unknown>;
			const plugin = resolvePluginExport(mod);
			if (plugin) return plugin;
		} catch {
			// fall through to error
		}
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
	if (m.bundleFormat !== 'esm') {
		throw new Error('Invalid plugin manifest: bundleFormat must be esm');
	}
}
