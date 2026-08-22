import type { PluginManifest } from '@chronos/core';
import { CHRONOS_ENGINE_VERSION } from '@chronos/core';

function parseSemver(version: string): [number, number, number] {
	const parts = version.trim().split('.');
	return [
		Number.parseInt(parts[0] ?? '0', 10) || 0,
		Number.parseInt(parts[1] ?? '0', 10) || 0,
		Number.parseInt(parts[2] ?? '0', 10) || 0
	];
}

/** Returns true when `engineVersion` satisfies `minRequired` (semver x.y.z). */
export function isEngineVersionCompatible(engineVersion: string, minRequired: string): boolean {
	const [engineMajor, engineMinor, enginePatch] = parseSemver(engineVersion);
	const [requiredMajor, requiredMinor, requiredPatch] = parseSemver(minRequired);

	if (engineMajor !== requiredMajor) return engineMajor > requiredMajor;
	if (engineMinor !== requiredMinor) return engineMinor > requiredMinor;
	return enginePatch >= requiredPatch;
}

export function assertEngineVersionCompatible(manifest: PluginManifest): void {
	if (!manifest.minEngineVersion) return;
	if (!isEngineVersionCompatible(CHRONOS_ENGINE_VERSION, manifest.minEngineVersion)) {
		throw new Error(
			`Plugin "${manifest.id}" requires engine >= ${manifest.minEngineVersion}, current is ${CHRONOS_ENGINE_VERSION}`
		);
	}
}

function isChronosPlugin(value: unknown): value is import('@chronos/core').ChronosPlugin {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as import('@chronos/core').ChronosPlugin;
	return typeof candidate.id === 'string' && typeof candidate.apply === 'function';
}

function resolvePluginExport(
	mod: Record<string, unknown>
): import('@chronos/core').ChronosPlugin | null {
	const candidate =
		(mod.default as import('@chronos/core').ChronosPlugin) ??
		(mod.plugin as import('@chronos/core').ChronosPlugin) ??
		(isChronosPlugin(mod) ? (mod as unknown as import('@chronos/core').ChronosPlugin) : null);
	if (isChronosPlugin(candidate)) return candidate;
	return null;
}

/** Load an ESM bundle from verified source code via blob/data dynamic import. */
export async function loadEsmPluginFromCode(
	code: string
): Promise<import('@chronos/core').ChronosPlugin> {
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
	if (typeof m.minEngineVersion === 'string' && m.minEngineVersion) {
		assertEngineVersionCompatible(manifest as PluginManifest);
	}
}
