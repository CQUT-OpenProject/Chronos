<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { getContext } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { page } from '$app/state';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import type { ShellTabController } from '$lib/shell/shell-tab.svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import ShellTabPanels from '$lib/components/shell/ShellTabPanels.svelte';
	import ShellWallpaper from '$lib/components/shell/ShellWallpaper.svelte';
	import { isShellWallpaperRevealed } from '$lib/components/shell/shell-wallpaper';
	import BottomTabBar from '$lib/components/BottomTabBar.svelte';
	import AdaptiveEdgeBar from '$lib/components/ui/AdaptiveEdgeBar.svelte';
	import TimetableWeekBadge from '$lib/components/timetable/TimetableWeekBadge.svelte';
	import {
		MountableSlotOutlet,
		resolvePluginScreenSlot,
		createEdgeBarActions,
		setEdgeBarActions
	} from '@chronos/ui-kit';
	import { resolveLocalizedText } from '@chronos/core';
	import EdgeBarActionButtons from '$lib/components/ui/EdgeBarActionButtons.svelte';
	import { ensureEngineFullyReady, getAppController } from '$lib/services/app-engine';
	import { isShellRoute } from '$lib/navigation/routes';
	import { secondaryTransitionGate } from '$lib/navigation';

	const shell = getContext<AppShellController>('appShell');
	const shellTab = getContext<ShellTabController>('shellTab');
	const timetableScreen = getContext<TimetableScreenController>('timetableScreen');
	const controller = getAppController();
	const edgeActions = createEdgeBarActions();
	setEdgeBarActions(edgeActions);
	const gate = secondaryTransitionGate;
	const compactLandscape = new MediaQuery('(orientation: landscape) and (max-height: 500px)');
	const activeTab = $derived(
		controller.getSlots('shell.bottom-bar.tab').find((tab) => tab.id === shellTab.activeTabId)
	);
	const activePluginId = $derived(
		activeTab && !activeTab.hostPanel
			? controller.resolveSlotOwner('shell.bottom-bar.tab', activeTab.id)
			: null
	);
	const pluginScreenSlot = $derived(
		activePluginId
			? resolvePluginScreenSlot(
					controller.getSlots('shell.route.screen'),
					activePluginId,
					'index',
					(slotId) => controller.resolveSlotOwner('shell.route.screen', slotId)
				)
			: undefined
	);
	const pluginRail = $derived(pluginScreenSlot?.landscapeRail);
	const pluginTitle = $derived(
		resolveLocalizedText(pluginScreenSlot?.title, '', controller.currentLocale)
	);
	const dropActive = $derived(
		Boolean(
			activeTab?.hostPanel === 'timetable' &&
			timetableScreen.state.isEditing &&
			timetableScreen.interaction.drag?.overDeleteZone
		)
	);
	const wallpaperUri = $derived(shell.state.dynamicColorUri);
	const wallpaperRevealed = $derived(
		isShellWallpaperRevealed({
			wallpaperUri,
			timetableSelected: activeTab?.hostPanel === 'timetable',
			hasTimetable: Boolean(timetableScreen.state.currentTimetable)
		})
	);

	let ready = $state(false);
	let markedVisible = false;

	onMount(async () => {
		await ensureEngineFullyReady();
		ready = true;
	});

	$effect(() => {
		if (!ready) return;
		const pathname = page.url.pathname;
		if (isShellRoute(pathname)) {
			gate.syncRoute(pathname);
			shellTab.init();
			if (!markedVisible && typeof performance !== 'undefined') {
				markedVisible = true;
				performance.mark('chronos-timetable-visible');
			}
			return;
		}

		if (gate.shellHostEnabled) {
			if (!gate.transitioning) gate.syncRoute(pathname);
			return;
		}

		return scheduleIdle(() => {
			gate.enableShellHost();
			shellTab.init();
			if (!gate.transitioning) gate.syncRoute(pathname);
		});
	});

	function scheduleIdle(callback: () => void): () => void {
		if (typeof requestIdleCallback === 'function') {
			const id = requestIdleCallback(callback);
			return () => cancelIdleCallback(id);
		}
		const id = setTimeout(callback, 0);
		return () => clearTimeout(id);
	}
</script>

{#if browser && gate.shellHostEnabled}
	<div class="shell-page min-h-dvh bg-canvas text-ink">
		<div class="relative h-[calc(100dvh-var(--bottom-bar-height))]">
			{#if wallpaperUri}
				<ShellWallpaper
					uri={wallpaperUri}
					revealed={wallpaperRevealed}
					blurred={timetableScreen.state.isEditing}
				/>
			{/if}
			<div class={['shell-content h-full', gate.skipPaint && 'is-frozen']}>
				<ShellTabPanels {ready} frozen={gate.frozen} />
			</div>
		</div>
		<div class="shell-tab-bar" class:hidden={gate.skipPaint} inert={gate.frozen}>
			<AdaptiveEdgeBar kind="shell" alert={dropActive}>
				{#snippet top()}
					{#if activeTab?.hostPanel === 'timetable' && timetableScreen.state.currentTimetable}
						<TimetableWeekBadge screen={timetableScreen} />
					{/if}
					{#if compactLandscape.current && activePluginId && pluginTitle}
						<h1 class="edge-bar-title" title={pluginTitle} aria-label={pluginTitle}>
							{pluginTitle}
						</h1>
					{/if}
				{/snippet}
				{#snippet content()}
					{#if compactLandscape.current && activePluginId && pluginRail}
						{#key activePluginId}
							<MountableSlotOutlet
								component={pluginRail}
								props={{
									controller,
									pluginId: activePluginId,
									viewId: 'index',
									active: !gate.frozen
								}}
								class="w-full"
							/>
						{/key}
					{/if}
				{/snippet}
				{#snippet bottom()}
					{#if compactLandscape.current && activePluginId && edgeActions.get(activePluginId).length}
						<EdgeBarActionButtons
							actions={edgeActions.get(activePluginId)}
							orientation="vertical"
						/>
					{/if}
					<BottomTabBar />
				{/snippet}
			</AdaptiveEdgeBar>
		</div>
	</div>
{/if}
