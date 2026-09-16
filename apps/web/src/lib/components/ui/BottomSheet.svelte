<script lang="ts">
	import { BottomSheet as UiBottomSheet } from '@chronos/ui-kit';
	import type { Snippet } from 'svelte';
	import { hostT } from '$lib/i18n/host-i18n.svelte';

	let {
		open = $bindable(false),
		title = '',
		description = '',
		showHandle = true,
		dragDismissAria,
		manageHistory = true,
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
</script>

<UiBottomSheet
	bind:this={uiSheet}
	bind:open
	{title}
	{description}
	{showHandle}
	dragDismissAria={resolvedDragDismissAria}
	{manageHistory}
	{actions}
	{children}
	{footer}
	{onOpenChange}
	{onOpenChangeComplete}
/>
