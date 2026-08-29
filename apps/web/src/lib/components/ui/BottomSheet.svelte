<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import {
		createHistoryOverlaySync,
		type HistoryOverlaySync
	} from '$lib/navigation/history-overlay';

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
</script>

<Dialog.Root bind:open {onOpenChangeComplete}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="bottom-sheet-overlay fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs"
		/>
		<Dialog.Content
			class="bottom-sheet-content rounded-t-sheet fixed inset-x-0 bottom-0 z-[70] flex max-h-[85dvh] flex-col border border-outline-variant/50 bg-surface-container-high text-on-surface shadow-xl outline-none"
		>
			<div class="flex shrink-0 justify-center pt-3" aria-hidden="true">
				<div class="h-1 w-10 rounded-full bg-on-surface-variant/40"></div>
			</div>

			{#if title || actions}
				<div class="flex shrink-0 items-center gap-3 px-4 pb-3">
					{#if title}
						<Dialog.Title
							class="m3-title-large min-w-0 flex-1 truncate font-medium text-on-surface"
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

	@media (prefers-reduced-motion: reduce) {
		:global(.bottom-sheet-overlay[data-dialog-overlay]),
		:global(.bottom-sheet-content[data-dialog-content]) {
			transition-duration: 1ms;
		}
	}
</style>
