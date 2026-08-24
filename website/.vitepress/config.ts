/** VitePress configuration for the Chronos documentation site. */
import { resolve } from 'node:path';
import type { DefaultTheme, PageData } from 'vitepress';
import type { ViteDevServer } from 'vite';
import { adrEntries, allHandwrittenPages, project, REPO_ROOT, type DocsPage } from '../project.ts';

project();

const REPO_URL = 'https://github.com/CQUT-OpenProject/Chronos';

function groupBySection(pages: DocsPage[]): DefaultTheme.SidebarItem[] {
	const groups = new Map<string, DocsPage[]>();
	for (const page of pages) {
		const entries = groups.get(page.section) ?? [];
		entries.push(page);
		groups.set(page.section, entries);
	}
	return [...groups.entries()].map(([section, entries]) => ({
		text: section,
		items: entries
			.sort((a, b) => a.order - b.order)
			.map((page) => ({ text: page.label, link: page.route.replace(/\.md$/, '') }))
	}));
}

function sidebarByPrefix(prefix: string): DocsPage[] {
	return allHandwrittenPages.filter((page) => page.route.startsWith(prefix) && page.section !== '');
}

const adrSidebar = (): DefaultTheme.SidebarItem[] => [
	{
		text: '架构决策记录',
		items: [
			{ text: '总览与索引', link: '/adr/' },
			...adrEntries().map(({ file, id, title }) => ({
				text: `${id} · ${title}`,
				link: `/adr/${file.replace(/\.md$/, '')}`
			}))
		]
	}
];

function watchCanonicalDocs(server: ViteDevServer): void {
	server.watcher.on('change', (changed) => {
		if (!changed.includes(`${REPO_ROOT}/docs/`) && !changed.includes(`${REPO_ROOT}/.agents/docs/`))
			return;
		project();
	});
}

export default {
	title: 'Chronos',
	description: '微内核插件化课表 PWA 的官方文档',
	cleanUrls: true,
	srcDir: '.generated',
	cacheDir: '.cache',
	outDir: '.dist',
	// Historical ADRs link to repository files via `../..` relative paths; they
	// resolve on GitHub but are not site pages.
	ignoreDeadLinks: [/\.\.\/\.\.\/(?:packages|apps|scripts)\//],
	head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]],
	themeConfig: {
		siteTitle: 'Chronos',
		logo: '/logo.svg',
		nav: [
			{ text: '入门', link: '/guide/getting-started', activeMatch: '^/guide/' },
			{ text: '开发', link: '/develop/architecture', activeMatch: '^/develop/' },
			{ text: '参考', link: '/reference/ports', activeMatch: '^/reference/' },
			{ text: '架构决策', link: '/adr/', activeMatch: '^/adr/' }
		],
		sidebar: {
			'/guide/': groupBySection(sidebarByPrefix('/guide/')),
			'/develop/': groupBySection(sidebarByPrefix('/develop/')),
			'/reference/': groupBySection(sidebarByPrefix('/reference/')),
			'/adr/': adrSidebar()
		},
		socialLinks: [{ icon: 'github', link: REPO_URL }],
		editLink: {
			pattern: ({ frontmatter }: PageData) => {
				// Inlined: VP2 serializes themeConfig functions without module scope.
				const repo = 'https://github.com/CQUT-OpenProject/Chronos';
				const data: unknown = frontmatter;
				const editSource: unknown =
					typeof data === 'object' && data !== null ? Reflect.get(data, 'editSource') : undefined;
				if (typeof editSource !== 'string') return `${repo}/edit/main/docs`;
				return `${repo}/edit/main/${editSource}`;
			},
			text: '在 GitHub 上编辑此页'
		},
		search: { provider: 'local' },
		outline: { label: '本页目录', level: [2, 3] },
		docFooter: { prev: '上一篇', next: '下一篇' },
		darkModeSwitchLabel: '外观',
		lightModeSwitchTitle: '切换到浅色主题',
		darkModeSwitchTitle: '切换到深色主题',
		sidebarMenuLabel: '菜单',
		returnToTopLabel: '返回顶部',
		langMenuLabel: '切换语言'
	},
	vite: {
		publicDir: resolve(import.meta.dirname, '../public'),
		plugins: [{ name: 'chronos-doc-projector', configureServer: watchCanonicalDocs }]
	}
};
