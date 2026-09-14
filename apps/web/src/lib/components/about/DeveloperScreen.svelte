<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { parseMarkdown } from '$lib/content/markdown';

	const markdownContent = $derived(hostT('developer.markdown'));
	let htmlContent = $state('');

	$effect(() => {
		const markdown = markdownContent;
		void parseMarkdown(markdown).then((html) => {
			htmlContent = html;
		});
	});
</script>

<div class="flex flex-col gap-5 px-4 py-2">
	<div class="markdown-prose markdown-prose--developer prose prose-sm max-w-none dark:prose-invert">
		{@html htmlContent}
	</div>
</div>
