<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import {
		createHistoryOverlaySync,
		type HistoryOverlaySync
	} from '$lib/navigation/history-overlay';
	import {
		clampDragOffset,
		overlayOpacityFromDrag,
		shouldDismissSheet
	} from '$lib/components/ui/bottom-sheet-drag';

	let {
		open = $bindable(false),
		title = '',
		actions,
		children,
		onOpenChangeComplete,
		manageHistory = true
	}: {
		open?: boolean;
		title?: string;
		actions?: Snippet;
		children?: Snippet;
		onOpenChangeComplete?: (open: boolean) => void;
		manageHistory?: boolean;
	} = $props();

	let historySync: HistoryOverlaySync | null = null;
	let titleRef = $state<HTMLElement | null>(null);
	let contentRef = $state<HTMLElement | null>(null);
	let overlayRef = $state<HTMLElement | null>(null);
	let dragHandleRef = $state<HTMLElement | null>(null);

	let dragOffsetPx = $state(0);
	let isDragging = $state(false);
	let isClosing = $state(false);
	let isSnappingBack = $state(false);
	let activePointerId: number | null = null;
	let startY = 0;

	const contentTransformStyle = $derived(
		dragOffsetPx > 0 || isClosing || isSnappingBack
			? `transform: translateY(${dragOffsetPx}px)`
			: undefined
	);

	function prefersReducedMotion(): boolean {
		return (
			typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	function getSheetHeight(): number {
		return contentRef?.getBoundingClientRect().height ?? 0;
	}

	function syncOverlayOpacity() {
		if (!overlayRef) return;
		const sheetHeight = getSheetHeight();
		overlayRef.style.opacity = String(overlayOpacityFromDrag(dragOffsetPx, sheetHeight));
	}

	function clearOverlayOpacity() {
		overlayRef?.style.removeProperty('opacity');
	}

	function resetDragState() {
		isDragging = false;
		isClosing = false;
		isSnappingBack = false;
		activePointerId = null;
		clearOverlayOpacity();
	}

	function finishDismiss() {
		resetDragState();
		open = false;
	}

	function releasePointerCapture(pointerId: number) {
		if (dragHandleRef?.hasPointerCapture(pointerId)) {
			try {
				dragHandleRef.releasePointerCapture(pointerId);
			} catch {
				// Ignore
			}
		}
	}

	function startDismissAnimation() {
		const sheetHeight = getSheetHeight();
		if (prefersReducedMotion()) {
			finishDismiss();
			return;
		}
		isClosing = true;
		requestAnimationFrame(() => {
			dragOffsetPx = sheetHeight;
			syncOverlayOpacity();
		});
	}

	function startSnapBackAnimation() {
		if (prefersReducedMotion()) {
			dragOffsetPx = 0;
			resetDragState();
			return;
		}
		isSnappingBack = true;
		requestAnimationFrame(() => {
			dragOffsetPx = 0;
			syncOverlayOpacity();
		});
	}

	function onHandlePointerDown(event: PointerEvent) {
		if (event.button !== 0 || isClosing || isSnappingBack) return;

		activePointerId = event.pointerId;
		startY = event.clientY;
		isDragging = true;

		if (dragHandleRef?.setPointerCapture) {
			try {
				dragHandleRef.setPointerCapture(event.pointerId);
			} catch {
				// Ignore
			}
		}
	}

	function onWindowPointerMove(event: PointerEvent) {
		if (activePointerId !== event.pointerId || !isDragging) return;

		dragOffsetPx = clampDragOffset(event.clientY - startY);
		syncOverlayOpacity();
	}

	function onWindowPointerUp(event: PointerEvent) {
		if (activePointerId !== event.pointerId) return;

		releasePointerCapture(event.pointerId);
		activePointerId = null;

		if (!isDragging) return;
		isDragging = false;

		const sheetHeight = getSheetHeight();
		if (shouldDismissSheet(dragOffsetPx, sheetHeight)) {
			startDismissAnimation();
			return;
		}

		startSnapBackAnimation();
	}

	function onWindowPointerCancel(event: PointerEvent) {
		if (activePointerId !== event.pointerId) return;

		releasePointerCapture(event.pointerId);
		activePointerId = null;

		if (!isDragging) return;
		isDragging = false;
		startSnapBackAnimation();
	}

	function onContentTransitionEnd(event: TransitionEvent) {
		if (event.target !== contentRef || event.propertyName !== 'transform') return;

		if (isClosing) {
			finishDismiss();
			return;
		}

		if (isSnappingBack) {
			resetDragState();
			dragOffsetPx = 0;
		}
	}

	function handleOpenAutoFocus(event: Event) {
		event.preventDefault();
		requestAnimationFrame(() => {
			(titleRef ?? contentRef)?.focus();
		});
	}

	export function skipNextHistoryBack() {
		historySync?.skipNextHistoryBack();
	}

	$effect(() => {
		if (!manageHistory) {
			historySync?.dispose();
			historySync = null;
			return;
		}

		const sync = createHistoryOverlaySync({
			isOpen: () => open,
			setOpen: (nextOpen) => {
				open = nextOpen;
			}
		});
		historySync = sync;
		return () => {
			sync.dispose();
			historySync = null;
		};
	});

	$effect(() => {
		if (!manageHistory || !historySync) return;
		void open;
		historySync.syncOpenState(open);
	});

	$effect(() => {
		if (open) {
			dragOffsetPx = 0;
			return;
		}

		resetDragState();
	});
</script>

<svelte:window
	onpointermove={onWindowPointerMove}
	onpointerup={onWindowPointerUp}
	onpointercancel={onWindowPointerCancel}
/>

<Dialog.Root bind:open {onOpenChangeComplete}>
	<Dialog.Portal>
		<Dialog.Overlay
			bind:ref={overlayRef}
			class="bottom-sheet-overlay fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs"
		/>
		<Dialog.Content
			bind:ref={contentRef}
			class="bottom-sheet-content rounded-t-sheet fixed inset-x-0 bottom-0 z-[70] flex max-h-[85dvh] flex-col border border-outline-variant/50 bg-surface-container-high text-on-surface shadow-xl outline-none"
			style={contentTransformStyle}
			data-dragging={isDragging ? '' : undefined}
			data-snapping-back={isSnappingBack ? '' : undefined}
			data-closing={isClosing ? '' : undefined}
			ontransitionend={onContentTransitionEnd}
			onOpenAutoFocus={handleOpenAutoFocus}
		>
			<div
				bind:this={dragHandleRef}
				class="flex shrink-0 touch-none justify-center py-3"
				aria-label={hostT('ui.bottomSheet.dragDismissAria')}
				onpointerdown={onHandlePointerDown}
			>
				<div class="h-1 w-10 rounded-full bg-on-surface-variant/40"></div>
			</div>

			{#if title || actions}
				<div class="flex shrink-0 items-center gap-3 px-4 pb-3">
					{#if title}
						<Dialog.Title
							bind:ref={titleRef}
							tabindex={-1}
							class="text-title-large min-w-0 flex-1 truncate font-medium text-on-surface outline-none"
						>
							{title}
						</Dialog.Title>
					{/if}
					{#if actions}
						<div class="shrink-0">
							{@render actions()}
						</div>
					{/if}
				</div>
			{/if}

			{#if children}
				<div class="min-h-0 flex-1 overflow-y-auto pb-[var(--tabbar-safe)]">
					{@render children()}
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	:global(.bottom-sheet-overlay[data-dialog-overlay]) {
		transition: opacity 300ms cubic-bezier(0.05, 0.7, 0.1, 1);
		opacity: 1;
	}

	:global(.bottom-sheet-overlay[data-dialog-overlay][data-starting-style]),
	:global(.bottom-sheet-overlay[data-dialog-overlay][data-ending-style]) {
		opacity: 0;
	}

	:global(.bottom-sheet-content[data-dialog-content]) {
		transition: transform 300ms cubic-bezier(0.05, 0.7, 0.1, 1);
		transform: translateY(0);
	}

	:global(.bottom-sheet-content[data-dialog-content][data-starting-style]),
	:global(.bottom-sheet-content[data-dialog-content][data-ending-style]) {
		transform: translateY(100%);
	}

	:global(.bottom-sheet-content[data-dragging]) {
		transition: none !important;
	}

	:global(.bottom-sheet-content[data-snapping-back]),
	:global(.bottom-sheet-content[data-closing]) {
		transition: transform 300ms cubic-bezier(0.05, 0.7, 0.1, 1) !important;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.bottom-sheet-overlay[data-dialog-overlay]),
		:global(.bottom-sheet-content[data-dialog-content]) {
			transition-duration: 1ms;
		}
	}
</style>
