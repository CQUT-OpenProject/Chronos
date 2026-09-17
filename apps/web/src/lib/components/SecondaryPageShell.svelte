<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { ArrowBack } from '$lib/icons';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import { haptic } from '$lib/haptic/haptic';
	import { navigateBack, type BackFallback } from '$lib/navigation';
	import { registerPageBackFallback } from '$lib/navigation/nav-coordinator';
	import {
		appShellScroll,
		MountableSlotOutlet,
		createEdgeBarActions,
		setEdgeBarActions
	} from '@chronos/ui-kit';
	import type { ChronosMountable } from '@chronos/core';
	import { MediaQuery } from 'svelte/reactivity';
	import { getAppController } from '$lib/services/app-engine';
	import AdaptiveEdgeBar from '$lib/components/ui/AdaptiveEdgeBar.svelte';
	import EdgeBarActionButtons from '$lib/components/ui/EdgeBarActionButtons.svelte';

	let {
		title,
		backFallback = { kind: 'shell' } as BackFallback,
		actions,
		landscapeRail,
		railPluginId,
		railViewId = 'index',
		flush = false,
		children
	}: {
		title: string;
		backFallback?: BackFallback;
		actions?: import('svelte').Snippet;
		landscapeRail?: ChronosMountable;
		railPluginId?: string;
		railViewId?: string;
		flush?: boolean;
		children?: import('svelte').Snippet;
	} = $props();

	const controller = getAppController();
	const edgeActions = createEdgeBarActions();
	const compactLandscape = new MediaQuery('(orientation: landscape) and (max-height: 500px)');
	setEdgeBarActions(edgeActions);

	$effect(() => {
		return registerPageBackFallback(backFallback);
	});

	function handleBack(event: MouseEvent) {
		event.preventDefault();
		haptic.light();
		navigateBack(backFallback);
	}
</script>

<div
	class="secondary-page relative z-[var(--z-secondary-page)] flex h-dvh flex-col overflow-hidden bg-canvas"
>
	<TopAppBar {title} {actions} class="shrink-0">
		{#snippet leading()}
			<IconButton ariaLabel={hostT('ui.nav.back')} onclick={handleBack}>
				<ArrowBack class="size-6 text-on-surface" />
			</IconButton>
		{/snippet}
	</TopAppBar>
	{#if flush}
		<main class="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
			{@render children?.()}
		</main>
	{:else}
		<main use:appShellScroll class="secondary-scroll min-h-0 w-full flex-1 overflow-y-auto">
			<div class="mx-auto w-full max-w-lg p-4">{@render children?.()}</div>
		</main>
	{/if}
	<AdaptiveEdgeBar kind="secondary">
		{#snippet top()}
			<IconButton ariaLabel={hostT('ui.nav.back')} onclick={handleBack}>
				<ArrowBack class="size-6 text-on-surface" />
			</IconButton>
			<h1 class="edge-bar-title" {title} aria-label={title}>{title}</h1>
		{/snippet}
		{#snippet content()}
			{#if compactLandscape.current && landscapeRail && railPluginId}
				{#key `${railPluginId}/${railViewId}`}
					<MountableSlotOutlet
						component={landscapeRail}
						props={{ controller, pluginId: railPluginId, viewId: railViewId, active: true }}
						class="w-full"
					/>
				{/key}
			{/if}
		{/snippet}
		{#snippet bottom()}
			{#if actions}
				<div class="edge-bar-top-actions">{@render actions()}</div>
			{/if}
			{#if edgeActions.get(railPluginId ?? 'page').length > 0}
				<EdgeBarActionButtons
					actions={edgeActions.get(railPluginId ?? 'page')}
					orientation="vertical"
				/>
			{/if}
		{/snippet}
	</AdaptiveEdgeBar>
</div>
