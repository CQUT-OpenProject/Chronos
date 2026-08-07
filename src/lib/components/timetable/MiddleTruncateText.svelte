<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import {
		createCanvasMeasurer,
		resolveFont,
		truncateMiddle,
		truncateMiddleMultiline
	} from '$lib/text/middle-truncate';

	interface Props {
		text: string;
		class?: string;
		style?: string;
	}

	let { text, class: className = '', style }: Props = $props();

	function parseLineHeightPx(styleValue: string, fontSizePx: number): number {
		const trimmed = styleValue.trim();
		if (!trimmed || trimmed === 'normal') return fontSizePx * 1.2;
		if (trimmed.endsWith('px')) {
			const parsed = Number.parseFloat(trimmed);
			return Number.isFinite(parsed) && parsed > 0 ? parsed : fontSizePx * 1.2;
		}
		const ratio = Number.parseFloat(trimmed);
		if (Number.isFinite(ratio) && ratio > 0) return fontSizePx * ratio;
		return fontSizePx * 1.2;
	}

	// Stable identity: resize observer stays mounted; $effect re-applies when `text` changes.
	const truncateAttach: Attachment = (node) => {
		const apply = () => {
			const content = text;
			const width = node.clientWidth;
			if (width <= 0) {
				node.textContent = content;
				node.removeAttribute('title');
				return;
			}

			const measure = createCanvasMeasurer(resolveFont(node));
			const computed = getComputedStyle(node);
			const fontSize = Number.parseFloat(computed.fontSize) || 12;
			const lineHeight = parseLineHeightPx(computed.lineHeight, fontSize);
			let fittedLines = Math.max(1, Math.floor(node.clientHeight / lineHeight + 1e-6));
			let display = truncateMiddleMultiline(content, width, fittedLines, measure);
			node.textContent = display;

			// Canvas width can disagree with CSS break-all wrapping; shrink until DOM fits.
			let guard = 0;
			while (node.scrollHeight > node.clientHeight + 0.5 && fittedLines > 1 && guard < 12) {
				fittedLines -= 1;
				display = truncateMiddleMultiline(content, width, fittedLines, measure);
				node.textContent = display;
				guard += 1;
			}
			if (node.scrollHeight > node.clientHeight + 0.5) {
				display = truncateMiddle(content, width, measure);
				node.textContent = display;
			}

			if (display !== content) {
				node.title = content;
			} else {
				node.removeAttribute('title');
			}
		};

		$effect(() => {
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
