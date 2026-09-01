<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { Component } from 'svelte';
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
	const activeTab = $derived(tabs.find((tab) => tab.id === activeTabId));
	const hostPanel = $derived(activeTab?.hostPanel);
	const pluginTabId = $derived(hostPanel ? undefined : activeTabId);
	const pluginId = $derived(
		pluginTabId ? controller.resolveSlotOwner('shell.bottom-bar.tab', pluginTabId) : undefined
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
		if (hostPanel === 'mine' && !MineScreen) {
			void import('$lib/components/mine/MineScreen.svelte').then((module) => {
				MineScreen = module.default;
			});
		}
	});

	$effect(() => {
		if (
			ready &&
			hostPanel === 'timetable' &&
			screen.state.hasLoadedAppState &&
			!CourseDetailSheet
		) {
			void import('$lib/components/timetable/CourseDetailSheet.svelte').then((module) => {
				CourseDetailSheet = module.default;
			});
		}
	});

	$effect(() => {
		if (pluginId && !PluginScreenContainer) {
			void import('@chronos/ui-kit').then((module) => {
				PluginScreenContainer = module.PluginScreenContainer;
			});
		}
	});

	function openCourseDetail(courseId: string) {
		detailCourseId = courseId;
		detailOpen = true;
		trackEvent('course_detail_open');
	}
</script>

{#if !browser || !ready}
	<div class="flex min-h-[60vh] items-center justify-center p-4">
		<LoadingIndicator />
	</div>
{:else if hostPanel === 'timetable' && screen.state.hasLoadedAppState && !screen.state.currentTimetable}
	<EmptyTimetableState />
{:else if hostPanel === 'timetable' && screen.state.hasLoadedAppState}
	<TimetableScreen
		{screen}
		onEditTimetableDetails={() => goto(resolve('/timetable/details'))}
		onCourseClick={openCourseDetail}
	/>
	{#if CourseDetailSheet}
		<CourseDetailSheet bind:open={detailOpen} bind:courseId={detailCourseId} />
	{/if}
{:else if hostPanel === 'timetable'}
	<div class="flex min-h-[60vh] items-center justify-center p-4">
		<LoadingIndicator />
	</div>
{:else if hostPanel === 'mine'}
	{#if MineScreen}
		<MineScreen {shell} />
	{:else}
		<div class="flex min-h-[60vh] items-center justify-center p-4">
			<LoadingIndicator />
		</div>
	{/if}
{:else if pluginId && PluginScreenContainer}
	<PluginScreenContainer {controller} {pluginId} />
{:else if pluginId}
	<div class="flex min-h-[60vh] items-center justify-center p-4">
		<LoadingIndicator />
	</div>
{/if}
