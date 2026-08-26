import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export type ChronosAliasEntry = { find: string | RegExp; replacement: string };

/**
 * Build Vite/Rolldown resolve aliases for all @chronos/* workspace packages.
 * Subpath exports are sorted before package roots to avoid prefix shadowing.
 */
export function createChronosAlias(root?: string): ChronosAliasEntry[] {
	const monorepoRoot = root ?? resolve(fileURLToPath(new URL('..', import.meta.url)));
	const alias: ChronosAliasEntry[] = [];
	const seen = new Set<string>();

	function addPackage(pkgDir: string) {
		const pkgJsonPath = resolve(pkgDir, 'package.json');
		if (!existsSync(pkgJsonPath)) return;
		try {
			const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as {
				name: string;
				exports?: Record<string, unknown>;
				main?: string;
			};
			const exportsMap = pkg.exports as
				| Record<string, { import?: string; default?: string } | string>
				| undefined;
			if (exportsMap) {
				for (const [key, value] of Object.entries(exportsMap)) {
					const importPath = key === '.' ? pkg.name : `${pkg.name}${key.slice(1)}`;
					if (seen.has(importPath)) continue;
					seen.add(importPath);
					const target =
						typeof value === 'string'
							? value
							: ((value as { import?: string; default?: string }).import ??
								(value as { import?: string; default?: string }).default);
					if (!target) continue;
					const replacement = fileURLToPath(new URL(target as string, `file://${pkgDir}/`));
					if (key === '.') {
						alias.push({
							find: new RegExp(`^${pkg.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
							replacement
						});
					} else {
						alias.push({ find: importPath, replacement });
					}
				}
			} else if (pkg.name && pkg.main) {
				if (!seen.has(pkg.name)) {
					seen.add(pkg.name);
					alias.push({
						find: new RegExp(`^${pkg.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
						replacement: resolve(pkgDir, pkg.main)
					});
				}
			}
		} catch {}
	}

	for (const entry of readdirSync(resolve(monorepoRoot, 'packages'))) {
		const pkgDir = resolve(monorepoRoot, `packages/${entry}`);
		if (existsSync(resolve(pkgDir, 'package.json'))) addPackage(pkgDir);
	}

	const pluginsRoot = resolve(monorepoRoot, 'packages/plugins');
	if (existsSync(pluginsRoot)) {
		for (const entry of readdirSync(pluginsRoot)) {
			const pkgDir = resolve(pluginsRoot, entry);
			if (existsSync(resolve(pkgDir, 'package.json'))) addPackage(pkgDir);
		}
	}

	alias.sort((a, b) => {
		const aStr = a.find.toString();
		const bStr = b.find.toString();
		return bStr.length - aStr.length;
	});

	return alias;
}

/** Convert alias entries to a plain object for Rolldown `resolve.alias` record form. */
export function createChronosAliasRecord(root?: string): Record<string, string> {
	const record: Record<string, string> = {};
	for (const entry of createChronosAlias(root)) {
		const key =
			typeof entry.find === 'string'
				? entry.find
				: entry.find.source.replace(/^\^/, '').replace(/\$$/, '');
		record[key] = entry.replacement;
	}
	return record;
}
