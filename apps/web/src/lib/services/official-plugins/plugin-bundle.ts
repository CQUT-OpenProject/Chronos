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
		(isChronosPlugin(mod) ? (mod as unknown as import('@chronos/core').ChronosPlugin) : null);
	if (isChronosPlugin(candidate)) return candidate;
	return null;
}

/** Load an ESM bundle from verified source code via blob/data dynamic import. */
export async function loadEsmPluginFromCode(
	code: string
): Promise<import('@chronos/core').ChronosPlugin> {
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
	if (m.bundleFormat !== 'esm') {
		throw new Error('Invalid plugin manifest: bundleFormat must be esm');
	}

	const hasBundle = typeof m.bundleUrl === 'string' && m.bundleUrl.length > 0;
	const hasColors = typeof m.colorsUrl === 'string' && m.colorsUrl.length > 0;

	if (!hasBundle && !hasColors) {
		throw new Error('Invalid plugin manifest: require bundleUrl or colorsUrl');
	}
	if (hasBundle) {
		if (typeof m.sha256 !== 'string' || !m.sha256) {
			throw new Error('Invalid plugin manifest: missing sha256 for bundleUrl');
		}
	}
	if (hasColors) {
		if (typeof m.colorsSha256 !== 'string' || !m.colorsSha256) {
			throw new Error('Invalid plugin manifest: missing colorsSha256 for colorsUrl');
		}
	}
	if (typeof m.iconThemeUrl === 'string' && m.iconThemeUrl) {
		if (typeof m.iconThemeSha256 !== 'string' || !m.iconThemeSha256) {
			throw new Error('Invalid plugin manifest: missing iconThemeSha256 for iconThemeUrl');
		}
	}
	if (typeof m.cssUrl === 'string' && m.cssUrl) {
		if (typeof m.cssSha256 !== 'string' || !m.cssSha256) {
			throw new Error('Invalid plugin manifest: missing cssSha256 for cssUrl');
		}
	}
}
