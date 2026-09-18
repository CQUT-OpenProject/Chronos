<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { truncateMiddleByFit } from '../utils/middle-truncate';
	import {
		getMiddleTruncateResult,
		setMiddleTruncateResult,
		subscribeMiddleTruncateFontChanges
	} from '../utils/middle-truncate-result-cache';

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
		const computed = getComputedStyle(el);
		const key = JSON.stringify([
			content,
			style,
			className,
			width,
			height,
			computed.fontFamily,
			computed.fontSize,
			computed.fontWeight,
			computed.fontStyle,
			computed.fontStretch,
			computed.lineHeight,
			computed.fontVariationSettings,
			computed.fontFeatureSettings,
			computed.letterSpacing,
			computed.wordSpacing,
			computed.fontKerning,
			computed.textIndent,
			computed.wordBreak,
			computed.whiteSpace,
			computed.textTransform,
			computed.writingMode,
			window.devicePixelRatio
		]);
		if (key === lastKey) return;
		lastKey = key;

		if (width <= 0 || height <= 0) {
			el.textContent = content;
			el.removeAttribute('title');
			return;
		}

		const fits = (candidate: string) => {
			el.textContent = candidate;
			return el.scrollHeight <= el.clientHeight + 0.5;
		};
		const cached = getMiddleTruncateResult(key);
		const display =
			cached !== undefined && fits(cached) ? cached : truncateMiddleByFit(content, fits);
		if (display !== cached) setMiddleTruncateResult(key, display);
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
		const unsubscribeFonts = subscribeMiddleTruncateFontChanges(() => {
			lastKey = '';
			const size = boxSize(el);
			apply(el, size.width, size.height);
		});
		observer.observe(el);
		const size = boxSize(el);
		if (size.width > 0 && size.height > 0) {
			apply(el, size.width, size.height);
		}
		return () => {
			cancelAnimationFrame(rafId);
			observer.disconnect();
			unsubscribeFonts();
			if (node === el) node = null;
			lastKey = '';
			boxWidth = 0;
			boxHeight = 0;
		};
	};

	$effect(() => {
		void text;
		void style;
		void className;
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
