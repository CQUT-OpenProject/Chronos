<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import { trackEvent } from '$lib/client/analytics';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import TimetableScreen from '$lib/components/timetable/TimetableScreen.svelte';
	import CourseDetailSheet from '$lib/components/timetable/CourseDetailSheet.svelte';
	import EmptyTimetableState from '$lib/components/timetable/EmptyTimetableState.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import { ensureEngineReady, getAppController } from '$lib/services/app-engine';
	import { tryDefaultLaunchRedirect } from '$lib/shell/default-launch-tab';

	const screen = getContext<TimetableScreenController>('timetableScreen');

	let launchResolved = $state(false);
	let clientReady = $state(false);
	let detailOpen = $state(false);
	let detailCourseId = $state<string | null>(null);

	onMount(async () => {
		await ensureEngineReady();
		if (await tryDefaultLaunchRedirect(page.url.pathname, getAppController())) {
			return;
		}
		launchResolved = true;
		clientReady = true;
		screen.refresh();
	});

	function openCourseDetail(courseId: string) {
		detailCourseId = courseId;
		detailOpen = true;
		trackEvent('course_detail_open');
	}
</script>

{#if browser && launchResolved && clientReady && screen.state.hasLoadedAppState && !screen.state.currentTimetable}
	<EmptyTimetableState />
{:else if browser && launchResolved && clientReady && screen.state.hasLoadedAppState}
	<TimetableScreen
		{screen}
		onEditTimetableDetails={() => goto(resolve('/timetable/details'))}
		onCourseClick={openCourseDetail}
	/>
	<CourseDetailSheet bind:open={detailOpen} bind:courseId={detailCourseId} />
{:else if browser}
	<div class="flex min-h-[60vh] items-center justify-center p-4">
		<LoadingIndicator />
	</div>
{/if}
