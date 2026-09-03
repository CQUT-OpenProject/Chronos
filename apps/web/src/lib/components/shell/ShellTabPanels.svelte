<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { Component, Snippet } from 'svelte';
	import { trackEvent } from '$lib/client/analytics';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import type { ShellTabController } from '$lib/shell/shell-tab.svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import TimetableScreen from '$lib/components/timetable/TimetableScreen.svelte';
	import EmptyTimetableState from '$lib/components/timetable/EmptyTimetableState.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import { getAppController } from '$lib/services/app-engine';

	interface Props {
		ready: boolean;
	}

	let { ready }: Props = $props();

	const shellTab = getContext<ShellTabController>('shellTab');
	const shell = getContext<AppShellController>('appShell');
	const screen = getContext<TimetableScreenController>('timetableScreen');
	const controller = getAppController();

	const activeTabId = $derived(shellTab.activeTabId);
	const tabs = $derived(controller.getSlots('shell.bottom-bar.tab'));
	const timetableTabId = $derived(tabs.find((tab) => tab.hostPanel === 'timetable')?.id);
	const mineTabId = $derived(tabs.find((tab) => tab.hostPanel === 'mine')?.id);
	const timetableActive = $derived(Boolean(timetableTabId && activeTabId === timetableTabId));
	const mineActive = $derived(Boolean(mineTabId && activeTabId === mineTabId));
	const timetableMounted = $derived(
		Boolean(timetableTabId && shellTab.mountedTabIds.has(timetableTabId))
	);
	const mineMounted = $derived(Boolean(mineTabId && shellTab.mountedTabIds.has(mineTabId)));
	const mountedPluginTabs = $derived(
		tabs.filter((tab) => !tab.hostPanel && shellTab.mountedTabIds.has(tab.id))
	);

	let detailOpen = $state(false);
	let detailCourseId = $state<string | null>(null);

	let MineScreen = $state<Component<{ shell: AppShellController }> | null>(null);
	let CourseDetailSheet = $state<Component<{
		open: boolean;
		courseId: string | null;
	}> | null>(null);
	let PluginScreenContainer = $state<Component<{
		controller: ReturnType<typeof getAppController>;
		pluginId: string;
	}> | null>(null);

	$effect(() => {
		if (mineMounted && !MineScreen) {
			void import('$lib/components/mine/MineScreen.svelte').then((module) => {
				MineScreen = module.default;
			});
		}
	});

	$effect(() => {
		if (ready && timetableMounted && screen.state.hasLoadedAppState && !CourseDetailSheet) {
			void import('$lib/components/timetable/CourseDetailSheet.svelte').then((module) => {
				CourseDetailSheet = module.default;
			});
		}
	});

	$effect(() => {
		if (mountedPluginTabs.length > 0 && !PluginScreenContainer) {
			void import('@chronos/ui-kit').then((module) => {
				PluginScreenContainer = module.PluginScreenContainer;
			});
		}
	});

	$effect(() => {
		if (!ready) return;
		const tabId = timetableTabId;
		if (!tabId || activeTabId === tabId || shellTab.mountedTabIds.has(tabId)) return;
		return scheduleIdle(() => {
			shellTab.warmup(tabId);
		});
	});

	function openCourseDetail(courseId: string) {
		detailCourseId = courseId;
		detailOpen = true;
		trackEvent('course_detail_open');
	}

	function scheduleIdle(callback: () => void): () => void {
		if (typeof requestIdleCallback === 'function') {
			const id = requestIdleCallback(callback);
			return () => cancelIdleCallback(id);
		}
		const id = setTimeout(callback, 0);
		return () => clearTimeout(id);
	}
</script>

{#snippet panel(active: boolean, content: Snippet)}
	<div
		class={['absolute inset-0 overflow-y-auto', !active && 'pointer-events-none invisible']}
		inert={!active}
		aria-hidden={!active}
	>
		{@render content()}
	</div>
{/snippet}

{#snippet loading()}
	<div class="flex min-h-[60vh] items-center justify-center p-4">
		<LoadingIndicator />
	</div>
{/snippet}

{#if !browser || !ready}
	{@render loading()}
{:else}
	<div class="relative h-[calc(100dvh-var(--bottom-bar-height))] overflow-hidden">
		{#if timetableMounted}
			{@render panel(timetableActive, timetablePanel)}
		{/if}
		{#if mineMounted}
			{@render panel(mineActive, minePanel)}
		{/if}
		{#each mountedPluginTabs as tab (tab.id)}
			{@const ownerId = controller.resolveSlotOwner('shell.bottom-bar.tab', tab.id)}
			{@const pluginActive = activeTabId === tab.id}
			<div
				class={[
					'absolute inset-0 overflow-y-auto',
					!pluginActive && 'pointer-events-none invisible'
				]}
				inert={!pluginActive}
				aria-hidden={!pluginActive}
			>
				{#if ownerId && PluginScreenContainer}
					<PluginScreenContainer {controller} pluginId={ownerId} />
				{:else}
					{@render loading()}
				{/if}
			</div>
		{/each}
	</div>
{/if}

{#snippet timetablePanel()}
	{#if screen.state.hasLoadedAppState && !screen.state.currentTimetable}
		<EmptyTimetableState />
	{:else if screen.state.hasLoadedAppState}
		<TimetableScreen
			{screen}
			active={timetableActive}
			onEditTimetableDetails={() => goto(resolve('/timetable/details'))}
			onCourseClick={openCourseDetail}
		/>
		{#if CourseDetailSheet}
			<CourseDetailSheet bind:open={detailOpen} bind:courseId={detailCourseId} />
		{/if}
	{:else}
		{@render loading()}
	{/if}
{/snippet}

{#snippet minePanel()}
	{#if MineScreen}
		<MineScreen {shell} />
	{:else}
		{@render loading()}
	{/if}
{/snippet}
