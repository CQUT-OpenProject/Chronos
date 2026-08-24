<script lang="ts">
	import { parseMarkdown } from '$lib/content/markdown';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
	const markdownContent = $derived(hostTextRead(controller, 'developer.markdown'));
	const htmlContent = $derived(parseMarkdown(markdownContent));
</script>

<div
	class="markdown-prose markdown-prose--developer prose prose-sm max-w-none px-4 py-2 dark:prose-invert"
>
	{@html htmlContent}
</div>
