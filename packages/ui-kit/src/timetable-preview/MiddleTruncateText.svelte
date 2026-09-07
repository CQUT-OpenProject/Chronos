<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { truncateMiddleByFit } from '../utils/middle-truncate';

	interface Props {
		text: string;
		class?: string;
		style?: string;
	}

	let { text, class: className = '', style }: Props = $props();

	let node = $state<HTMLElement | null>(null);
	let boxWidth = 0;
	let boxHeight = 0;
	let lastKey = '';

	function boxSize(el: HTMLElement, entry?: ResizeObserverEntry) {
		const box = entry?.contentBoxSize?.[0];
		if (box) {
			return { width: box.inlineSize, height: box.blockSize };
		}
		if (entry) {
			return { width: entry.contentRect.width, height: entry.contentRect.height };
		}
		const rect = el.getBoundingClientRect();
		return { width: rect.width, height: rect.height };
	}

	function apply(el: HTMLElement, width: number, height: number) {
		boxWidth = width;
		boxHeight = height;
		const content = text;
		const key = `${content}\0${style ?? ''}\0${width}\0${height}`;
		if (key === lastKey) return;
		lastKey = key;

		if (width <= 0 || height <= 0) {
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
		lastKey = '';
		let rafId = 0;
		const observer = new ResizeObserver((entries) => {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				const size = boxSize(el, entries[0]);
				apply(el, size.width, size.height);
			});
		});
		observer.observe(el);
		const size = boxSize(el);
		if (size.width > 0 && size.height > 0) {
			apply(el, size.width, size.height);
		}
		return () => {
			cancelAnimationFrame(rafId);
			observer.disconnect();
			if (node === el) node = null;
			lastKey = '';
			boxWidth = 0;
			boxHeight = 0;
		};
	};

	$effect(() => {
		void text;
		void style;
		if (!node) return;
		if (boxWidth > 0 && boxHeight > 0) {
			apply(node, boxWidth, boxHeight);
			return;
		}
		const size = boxSize(node);
		apply(node, size.width, size.height);
	});
</script>

<span
	class="block min-w-0 overflow-hidden break-all whitespace-normal {className}"
	{style}
	{@attach truncateAttach}
></span>
