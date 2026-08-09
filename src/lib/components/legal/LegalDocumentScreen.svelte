<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';

	let {
		title,
		backHref,
		documentPath
	}: {
		title: string;
		backHref: string;
		documentPath: string;
	} = $props();

	let loading = $state(true);
	let htmlContent = $state('');

	const renderer = new marked.Renderer();
	renderer.link = ({ href, title: linkTitle, text }) => {
		const titleAttr = linkTitle ? ` title="${linkTitle}"` : '';
		return `<a href="${href}"${titleAttr} target="_blank" rel="noreferrer">${text}</a>`;
	};

	onMount(async () => {
		const response = await fetch(documentPath);
		const markdown = response.ok ? await response.text() : '无法加载文档内容';
		htmlContent = marked.parse(markdown, { renderer, async: false }) as string;
		loading = false;
	});
</script>

<SecondaryPageShell {title} {backHref}>
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<LoadingIndicator />
		</div>
	{:else}
		<div class="legal-prose prose prose-sm max-w-none px-4 py-2 dark:prose-invert">
			{@html htmlContent}
		</div>
	{/if}
</SecondaryPageShell>

<style>
	.legal-prose :global(h1) {
		margin: 0 0 1rem;
		font-size: 1.25rem;
		line-height: 1.4;
		font-weight: 700;
		color: var(--color-on-surface);
	}

	.legal-prose :global(h2) {
		margin: 1.75rem 0 0.75rem;
		font-size: 1.0625rem;
		line-height: 1.5;
		font-weight: 600;
		color: var(--color-primary);
	}

	.legal-prose :global(h3) {
		margin: 1.25rem 0 0.5rem;
		font-size: 0.9375rem;
		line-height: 1.5;
		font-weight: 600;
		color: var(--color-on-surface);
	}

	.legal-prose :global(p) {
		margin: 0 0 0.75rem;
		color: var(--color-on-surface-variant);
		line-height: 1.65;
	}

	.legal-prose :global(ul),
	.legal-prose :global(ol) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0 0 1rem;
		padding-left: 1.25rem;
		color: var(--color-on-surface-variant);
	}

	.legal-prose :global(li) {
		line-height: 1.65;
	}

	.legal-prose :global(li::marker) {
		color: var(--color-brand);
		font-weight: 600;
	}

	.legal-prose :global(strong) {
		color: var(--color-on-surface);
		font-weight: 600;
	}

	.legal-prose :global(a) {
		color: var(--color-brand);
		text-decoration: underline;
		text-underline-offset: 0.125rem;
	}

	.legal-prose :global(a:hover) {
		opacity: 0.8;
	}

	.legal-prose :global(hr) {
		margin: 1.5rem 0;
		border: none;
		border-top: 1px solid var(--color-border);
	}

	.legal-prose :global(table) {
		width: 100%;
		margin: 0 0 1rem;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}

	.legal-prose :global(th),
	.legal-prose :global(td) {
		padding: 0.5rem 0.625rem;
		border: 1px solid var(--color-border);
		text-align: left;
		vertical-align: top;
	}

	.legal-prose :global(th) {
		background: var(--color-surface-container);
		color: var(--color-on-surface);
		font-weight: 600;
	}

	.legal-prose :global(td) {
		color: var(--color-on-surface-variant);
	}

	.legal-prose :global(em) {
		color: var(--color-on-surface-variant);
		font-style: italic;
	}
</style>
