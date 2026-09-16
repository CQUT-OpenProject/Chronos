<script lang="ts">
	import { BottomSheet as UiBottomSheet } from '@chronos/ui-kit';
	import type { Snippet } from 'svelte';
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { getOverlayHistoryPort } from '$lib/navigation/overlay-history-port';

	const historyPort = getOverlayHistoryPort();
	const instanceId = $props.id();

	let {
		open = $bindable(false),
		title = '',
		description = '',
		showHandle = true,
		dragDismissAria,
		manageHistory = true,
		overlayId,
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
		actions?: Snippet;
		children?: Snippet;
		footer?: Snippet;
		onOpenChange?: (open: boolean) => void;
		onOpenChangeComplete?: (open: boolean) => void;
	} = $props();

	const resolvedDragDismissAria = $derived(
		dragDismissAria ?? hostT('ui.bottomSheet.dragDismissAria')
	);
	const resolvedOverlayId = $derived(overlayId ?? `bottom-sheet-${instanceId}`);
</script>

<UiBottomSheet
	bind:open
	{title}
	{description}
	{showHandle}
	dragDismissAria={resolvedDragDismissAria}
	{manageHistory}
	overlayId={resolvedOverlayId}
	{historyPort}
	{actions}
	{children}
	{footer}
	{onOpenChange}
	{onOpenChangeComplete}
/>
