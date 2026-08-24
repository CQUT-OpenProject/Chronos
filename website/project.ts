/**
 * Canonical publication manifest for the Chronos documentation site.
 *
 * Hand-written Markdown lives in `docs/` at the repository tier; ADRs stay in
 * `.agents/docs/adr/` next to the agent tooling. This module projects both
 * into VitePress's generated source tree (`.generated/`) so canonical files
 * never move, and exposes the page metadata that drives nav and sidebars.
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

/** A documentation page projected into the VitePress source tree. */
export interface DocsPage {
	/** Repository-relative canonical Markdown source. */
	source: string;
	/** Generated-tree route, including the `.md` suffix. */
	route: string;
	/** Sidebar label. */
	label: string;
	/** Sidebar section within its collection. */
	section: string;
	/** Stable order within the section. */
	order: number;
}

/** Absolute repository root, shared with the VitePress config. */
export const REPO_ROOT = resolve(import.meta.dirname, '..');
const GENERATED = resolve(import.meta.dirname, '.generated');

/** Hand-written pages under `docs/`, projected verbatim. */
export const guidePages: DocsPage[] = [
	{
		source: 'docs/guide/getting-started.md',
		route: '/guide/getting-started.md',
		label: '快速开始',
		section: '入门',
		order: 1
	},
	{
		source: 'docs/guide/import-sources.md',
		route: '/guide/import-sources.md',
		label: '导入课表',
		section: '入门',
		order: 2
	}
];

export const developPages: DocsPage[] = [
	{
		source: 'docs/develop/architecture.md',
		route: '/develop/architecture.md',
		label: '架构地图',
		section: '开发',
		order: 1
	},
	{
		source: 'docs/develop/plugin-authoring.md',
		route: '/develop/plugin-authoring.md',
		label: '插件作者指南',
		section: '开发',
		order: 2
	},
	{
		source: 'docs/develop/cookbook/new-plugin.md',
		route: '/develop/cookbook/new-plugin.md',
		label: '新增一个官方插件',
		section: '操作手册',
		order: 3
	},
	{
		source: 'docs/develop/cookbook/new-slot-type.md',
		route: '/develop/cookbook/new-slot-type.md',
		label: '新增一种插槽类型',
		section: '操作手册',
		order: 4
	},
	{
		source: 'docs/develop/development.md',
		route: '/develop/development.md',
		label: '开发工作流',
		section: '开发',
		order: 5
	}
];

export const referencePages: DocsPage[] = [
	{
		source: 'docs/reference/ports.md',
		route: '/reference/ports.md',
		label: '端口契约',
		section: '参考',
		order: 1
	},
	{
		source: 'docs/reference/slots-catalog.md',
		route: '/reference/slots-catalog.md',
		label: '槽位目录',
		section: '参考',
		order: 2
	},
	{
		source: 'docs/reference/themes.md',
		route: '/reference/themes.md',
		label: '主题契约',
		section: '参考',
		order: 3
	}
];

export const homePage: DocsPage = {
	source: 'docs/index.md',
	route: '/index.md',
	label: '首页',
	section: '',
	order: 0
};

export const allHandwrittenPages: readonly DocsPage[] = [
	homePage,
	...guidePages,
	...developPages,
	...referencePages
];

const adrSourceDir = () => resolve(REPO_ROOT, '.agents/docs/adr');

/** Extracts `[ADR NNNN](./file.md) | **title**` rows from the ADR index table. */
export function adrEntries(): Array<{ file: string; id: string; title: string }> {
	const entries: Array<{ file: string; id: string; title: string }> = [];
	for (const line of readFileSync(resolve(adrSourceDir(), 'README.md'), 'utf8').split('\n')) {
		const m = line.match(/^\| \[ADR (\d+)\]\(\.\/([^\s)]+\.md)\)\s*\|\s*\*\*(.+)\*\*/);
		if (!m) continue;
		entries.push({ id: m[1], file: m[2], title: m[3] });
	}
	return entries;
}

/**
 * Projects canonical sources into `.generated/`. Idempotent; run before build
 * and on dev-server startup.
 */
export function project(): void {
	rmSync(GENERATED, { recursive: true, force: true });
	mkdirSync(GENERATED, { recursive: true });

	for (const page of allHandwrittenPages) {
		const dest = resolve(GENERATED, '.' + page.route);
		mkdirSync(resolve(dest, '..'), { recursive: true });
		cpSync(resolve(REPO_ROOT, page.source), dest);
	}

	const adrDir = resolve(GENERATED, 'adr');
	mkdirSync(adrDir, { recursive: true });
	cpSync(resolve(adrSourceDir(), 'README.md'), resolve(adrDir, 'index.md'));
	for (const name of readdirSync(adrSourceDir())) {
		if (/^\d{4}-.*\.md$/.test(name)) {
			cpSync(resolve(adrSourceDir(), name), resolve(adrDir, name));
		}
	}
}
