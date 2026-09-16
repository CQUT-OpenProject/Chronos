<script lang="ts">
	import { BottomSheet as UiBottomSheet } from '@chronos/ui-kit';
	import type { Snippet } from 'svelte';
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { bindOverlayCloser } from '$lib/navigation/nav-coordinator';
	import { createOverlayHistoryPort } from '$lib/navigation/overlay-history-port';

	const historyPort = createOverlayHistoryPort();
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

	let uiSheet: UiBottomSheet | null = $state(null);

	export function skipNextHistoryBack() {
		uiSheet?.skipNextHistoryBack();
	}

	const resolvedDragDismissAria = $derived(
		dragDismissAria ?? hostT('ui.bottomSheet.dragDismissAria')
	);
	const resolvedOverlayId = $derived(overlayId ?? `bottom-sheet-${instanceId}`);

	$effect(() => {
		if (!manageHistory) return;
		return bindOverlayCloser(resolvedOverlayId, () => {
			open = false;
		});
	});
</script>

<UiBottomSheet
	bind:this={uiSheet}
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
