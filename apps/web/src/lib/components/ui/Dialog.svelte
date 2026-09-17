<script lang="ts">
	import { Dialog } from 'bits-ui';
	import {
		createHistoryOverlaySync,
		OVERLAY_LIFECYCLE_CONTEXT,
		type HistoryOverlaySync
	} from '@chronos/ui-kit';
	import { getOverlayHistoryPort } from '$lib/navigation';
	import { onDestroy, getContext, setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		description = '',
		children,
		footer,
		onOpenChange
	}: {
		open?: boolean;
		title?: string;
		description?: string;
		children?: Snippet;
		footer?: Snippet;
		onOpenChange?: (open: boolean) => void;
	} = $props();

	const instanceId = $props.id();
	const historySync = createHistoryOverlaySync({
		overlayId: `dialog-${instanceId}`,
		port: getOverlayHistoryPort(),
		parent: getContext<HistoryOverlaySync | undefined>(OVERLAY_LIFECYCLE_CONTEXT),
		setOpen: (next) => {
			open = next;
			onOpenChange?.(next);
		}
	});
	setContext(OVERLAY_LIFECYCLE_CONTEXT, historySync);
	$effect(() => historySync.syncOpenState(open));
	onDestroy(() => historySync.dispose());
</script>

<Dialog.Root bind:open {onOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-[var(--z-overlay)] bg-black/50 backdrop-blur-xs transition-opacity duration-200"
		/>
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-[var(--z-overlay)] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-dialog bg-surface-container-high p-6 text-on-surface shadow-overlay transition-all duration-200 outline-none"
		>
			{#if title}
				<Dialog.Title class="text-headline-small font-medium text-on-surface">
					{title}
				</Dialog.Title>
			{/if}
			{#if description}
				<Dialog.Description class="text-body-medium text-on-surface-variant">
					{description}
				</Dialog.Description>
			{/if}

			{#if children}
				<div class="flex flex-col gap-3">
					{@render children()}
				</div>
			{/if}

			{#if footer}
				<div class="mt-2 flex items-center justify-end gap-2">
					{@render footer()}
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
