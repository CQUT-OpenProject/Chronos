<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { isReducedMotionActive } from '../motion/motion';
	import {
		clampDragOffset,
		needsSnapBackAnimation,
		overlayOpacityFromDrag,
		shouldDismissSheet
	} from './bottom-sheet-drag';
	import {
		createHistoryOverlaySync,
		type HistoryOverlaySync,
		type OverlayHistoryPort
	} from './history-overlay';

	let {
		open = $bindable(false),
		title = '',
		description = '',
		showHandle = true,
		dragDismissAria = 'Drag down to close',
		manageHistory = true,
		overlayId = 'bottom-sheet',
		historyPort,
		actions,
		children,
		footer,
		onOpenChange,
		onOpenChangeComplete
	}: {
		open?: boolean;
		title?: string;
		description?: string;
		showHandle?: boolean;
		dragDismissAria?: string;
		manageHistory?: boolean;
		overlayId?: string;
		historyPort?: OverlayHistoryPort;
		actions?: Snippet;
		children?: Snippet;
		footer?: Snippet;
		onOpenChange?: (open: boolean) => void;
		onOpenChangeComplete?: (open: boolean) => void;
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
	let sheetOpen = $state(false);

	const contentTransformStyle = $derived(
		dragOffsetPx > 0 || isSnappingBack ? `transform: translateY(${dragOffsetPx}px)` : undefined
	);

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
		sheetOpen = false;
		if (open) open = false;
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
		if (isReducedMotionActive() || sheetHeight <= 0) {
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
		if (isReducedMotionActive()) {
			dragOffsetPx = 0;
			resetDragState();
			return;
		}
		if (!needsSnapBackAnimation(dragOffsetPx)) {
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
		if (!showHandle || event.button !== 0 || isClosing || isSnappingBack) return;

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
			overlayId,
			port: historyPort,
			isOpen: () => sheetOpen,
			setOpen: (nextOpen) => {
				open = nextOpen;
				sheetOpen = nextOpen;
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
		void sheetOpen;
		historySync.syncOpenState(sheetOpen);
	});

	function handleDialogOpenChange(next: boolean) {
		if (next) {
			open = true;
			onOpenChange?.(true);
			return;
		}
		onOpenChange?.(false);
		open = false;
	}

	function handleOpenChangeComplete(isOpen: boolean) {
		if (!isOpen) {
			resetDragState();
			sheetOpen = false;
		}
		onOpenChangeComplete?.(isOpen);
	}

	$effect(() => {
		if (open) {
			resetDragState();
			dragOffsetPx = 0;
			sheetOpen = true;
			return;
		}

		if (sheetOpen) {
			sheetOpen = false;
		}
	});
</script>

<svelte:window
	onpointermove={showHandle ? onWindowPointerMove : undefined}
	onpointerup={showHandle ? onWindowPointerUp : undefined}
	onpointercancel={showHandle ? onWindowPointerCancel : undefined}
/>

<Dialog.Root
	bind:open={sheetOpen}
	onOpenChange={handleDialogOpenChange}
	onOpenChangeComplete={handleOpenChangeComplete}
>
	<Dialog.Portal>
		<Dialog.Overlay
			bind:ref={overlayRef}
			class="bottom-sheet-overlay fixed inset-0 z-[var(--z-overlay)] bg-black/50"
		/>
		<Dialog.Content
			bind:ref={contentRef}
			class="bottom-sheet-content rounded-t-sheet fixed inset-x-0 bottom-0 z-[var(--z-overlay)] flex max-h-[85dvh] flex-col bg-surface-container-high text-on-surface shadow-overlay outline-none"
			style={contentTransformStyle}
			data-dragging={isDragging ? '' : undefined}
			data-snapping-back={isSnappingBack ? '' : undefined}
			data-closing={isClosing ? '' : undefined}
			onOpenAutoFocus={handleOpenAutoFocus}
			ontransitionend={onContentTransitionEnd}
		>
			{#if showHandle}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					bind:this={dragHandleRef}
					class="relative flex shrink-0 touch-none justify-center py-3 before:absolute before:inset-x-0 before:-top-4 before:-bottom-4 before:content-['']"
					aria-label={dragDismissAria}
					onpointerdown={onHandlePointerDown}
				>
					<div class="h-1 w-10 rounded-full bg-on-surface-variant/40"></div>
				</div>
			{/if}

			{#if title || actions}
				<div
					class={['flex shrink-0 items-center gap-3', showHandle ? 'px-4 pb-3' : 'px-6 pt-6 pb-2']}
				>
					{#if title}
						<Dialog.Title
							bind:ref={titleRef}
							tabindex={-1}
							class={[
								'text-title-large min-w-0 flex-1 font-medium text-on-surface outline-none',
								showHandle ? 'truncate' : 'text-center'
							]}
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

			{#if description || children}
				<div
					class={[
						showHandle
							? [
									'app-scroll-y min-h-0 flex-1 overflow-y-auto',
									!footer && 'pb-[var(--tabbar-safe)]'
								]
							: 'shrink-0 px-6 pb-5'
					]}
				>
					{#if description}
						<Dialog.Description
							class={[
								'text-body-medium leading-relaxed text-on-surface-variant',
								!showHandle && 'text-center'
							]}
						>
							{description}
						</Dialog.Description>
					{/if}
					{#if children}
						{@render children()}
					{/if}
				</div>
			{/if}

			{#if footer}
				<div
					class={[
						'flex shrink-0 items-center gap-2',
						showHandle
							? 'mt-2 justify-end px-4 pb-[var(--tabbar-safe)]'
							: 'w-full justify-stretch gap-3 border-t border-outline-variant/40 px-6 pt-4 pb-[calc(var(--tabbar-safe)+0.75rem)] [&>button]:flex-1'
					]}
				>
					{@render footer()}
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

		@starting-style {
			transform: translateY(max(100%, 16rem));
		}
	}

	:global(.bottom-sheet-content[data-dialog-content][data-starting-style]),
	:global(.bottom-sheet-content[data-dialog-content][data-ending-style]) {
		transform: translateY(max(100%, 16rem));
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

	:root.reduce-motion :global(.bottom-sheet-overlay[data-dialog-overlay]),
	:root.reduce-motion :global(.bottom-sheet-content[data-dialog-content]) {
		transition-duration: 1ms;
	}
</style>
