<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import { trackEvent } from '$lib/client/analytics';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import type { ShellTabController } from '$lib/shell/shell-tab.svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import TimetableScreen from '$lib/components/timetable/TimetableScreen.svelte';
	import CourseDetailSheet from '$lib/components/timetable/CourseDetailSheet.svelte';
	import EmptyTimetableState from '$lib/components/timetable/EmptyTimetableState.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import MineScreen from '$lib/components/mine/MineScreen.svelte';
	import { PluginScreenContainer } from '@chronos/ui-kit';
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
	const pluginTabId = $derived(
		activeTabId === 'timetable' || activeTabId === 'mine' ? undefined : activeTabId
	);
	const pluginId = $derived(
		pluginTabId ? controller.resolveSlotOwner('shell.bottom-bar.tab', pluginTabId) : undefined
	);

	let detailOpen = $state(false);
	let detailCourseId = $state<string | null>(null);

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
{:else if activeTabId === 'timetable' && screen.state.hasLoadedAppState && !screen.state.currentTimetable}
	<EmptyTimetableState />
{:else if activeTabId === 'timetable' && screen.state.hasLoadedAppState}
	<TimetableScreen
		{screen}
		onEditTimetableDetails={() => goto(resolve('/timetable/details'))}
		onCourseClick={openCourseDetail}
	/>
	<CourseDetailSheet bind:open={detailOpen} bind:courseId={detailCourseId} />
{:else if activeTabId === 'timetable'}
	<div class="flex min-h-[60vh] items-center justify-center p-4">
		<LoadingIndicator />
	</div>
{:else if activeTabId === 'mine'}
	<MineScreen {shell} />
{:else if pluginId}
	<PluginScreenContainer {controller} {pluginId} />
{/if}
