<script lang="ts">
	import { marked } from 'marked';

	const markdownContent = `
## 一些有趣的事实

- Chronos **[ˈkrəʊ.nɒs]** 的名字来源于希腊神话中的时间之神
- Chronos 最初的使命是代替广告满天飞的 WakeUp 课程表
- Chronos-Android v1.0.0 由 GPT-5.4 编写，从空白文件夹到完整可发布版本仅用时 87 分钟
- Chronos-PWA v0.1.0 主要由 Composer 2.5 编写，整个迁移过程约为一周，相较 Android 旧版优化了使用体验

## 为什么使用 PWA

1. 解决 iOS 端应用分发的问题
2. Android coder 每天只做两件事：等 Studio 编译，看 Gradel 报错

## 问题反馈

除 GitHub Issue 外，本项目暂无其他公开的反馈渠道

## 特别感谢

- [「CQUT校园网登录脚本」](https://github.com/coldriver-chen/cqut-net-login)公开的重要信息
- 「CFC Studio-Timetable」提供的课表获取接口

## 加入开发团队

- 对某项功能不满意？Chronos 完全开源，欢迎自己动手修改！
- 本项目由[「重庆理工大学开源计划」](https://cqut-openproject.github.io/home/)维护，CQUT-OSP 致力于收集和维护本校开源项目
`.trim();

	const renderer = new marked.Renderer();
	renderer.link = ({ href, title, text }) => {
		const titleAttr = title ? ` title="${title}"` : '';
		return `<a href="${href}"${titleAttr} target="_blank" rel="noreferrer">${text}</a>`;
	};

	const htmlContent = marked.parse(markdownContent, { renderer, async: false }) as string;
</script>

<div class="developer-prose prose prose-sm max-w-none px-4 py-2 dark:prose-invert">
	{@html htmlContent}
</div>

<style>
	.developer-prose :global(h2) {
		margin: 1.5rem 0 0.75rem;
		font-family: var(--m3-font);
		font-size: 1.125rem;
		line-height: 1.5;
		font-weight: 600;
		color: var(--color-primary);
	}

	.developer-prose :global(h2:first-child) {
		margin-top: 0;
	}

	.developer-prose :global(p) {
		margin: 0 0 0.75rem;
		color: var(--color-on-surface-variant);
	}

	.developer-prose :global(ul),
	.developer-prose :global(ol) {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		margin: 0 0 1.25rem;
		padding-left: 1.25rem;
		color: var(--color-on-surface);
	}

	.developer-prose :global(li) {
		line-height: 1.6;
	}

	.developer-prose :global(li::marker) {
		color: var(--color-brand);
		font-weight: 600;
	}

	.developer-prose :global(strong) {
		color: var(--color-on-surface);
		font-weight: 600;
	}

	.developer-prose :global(a) {
		color: var(--color-brand);
		text-decoration: underline;
		text-underline-offset: 0.125rem;
	}

	.developer-prose :global(a:hover) {
		opacity: 0.8;
	}
</style>
