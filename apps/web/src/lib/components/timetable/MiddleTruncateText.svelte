<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { truncateMiddleByFit } from '$lib/text/middle-truncate';

	interface Props {
		text: string;
		class?: string;
		style?: string;
	}

	let { text, class: className = '', style }: Props = $props();

	let node = $state<HTMLElement | null>(null);

	function apply(el: HTMLElement) {
		const content = text;
		if (el.clientWidth <= 0 || el.clientHeight <= 0) {
			el.textContent = content;
			el.removeAttribute('title');
			return;
		}

		const display = truncateMiddleByFit(content, (candidate) => {
			el.textContent = candidate;
			return el.scrollHeight <= el.clientHeight + 0.5;
		});
		el.textContent = display;

		if (display !== content) {
			el.title = content;
		} else {
			el.removeAttribute('title');
		}
	}

	const truncateAttach: Attachment<HTMLElement> = (el) => {
		node = el;
		const observer = new ResizeObserver(() => {
			apply(el);
		});
		observer.observe(el);
		return () => {
			observer.disconnect();
			node = null;
		};
	};

	$effect(() => {
		void text;
		void style;
		if (node) {
			apply(node);
		}
	});
</script>

<span
	class="block min-w-0 overflow-hidden break-all whitespace-normal {className}"
	{style}
	{@attach truncateAttach}
></span>
