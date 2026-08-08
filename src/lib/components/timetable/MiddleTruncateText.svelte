<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { truncateMiddleByFit } from '$lib/text/middle-truncate';

	interface Props {
		text: string;
		class?: string;
		style?: string;
	}

	let { text, class: className = '', style }: Props = $props();

	// Stable identity: ResizeObserver stays mounted; $effect re-applies when `text` changes.
	const truncateAttach: Attachment = (node) => {
		const apply = () => {
			const content = text;
			if (node.clientWidth <= 0 || node.clientHeight <= 0) {
				node.textContent = content;
				node.removeAttribute('title');
				return;
			}

			const display = truncateMiddleByFit(content, (candidate) => {
				node.textContent = candidate;
				return node.scrollHeight <= node.clientHeight + 0.5;
			});
			node.textContent = display;

			if (display !== content) {
				node.title = content;
			} else {
				node.removeAttribute('title');
			}
		};

		$effect(() => {
			void text;
			void style;
			apply();
		});

		const observer = new ResizeObserver(apply);
		observer.observe(node);
		return () => observer.disconnect();
	};
</script>

<span
	class="block min-w-0 overflow-hidden break-all whitespace-normal {className}"
	{style}
	{@attach truncateAttach}
></span>
