<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import TimetableScreen from '$lib/components/timetable/TimetableScreen.svelte';
	import EmptyTimetableState from '$lib/components/timetable/EmptyTimetableState.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';

	const screen = getContext<TimetableScreenController>('timetableScreen');

	onMount(() => {
		screen.refresh();
	});

	function navigateToCourseDetail(courseId: string) {
		goto(resolve(`/timetable/course-detail?courseId=${encodeURIComponent(courseId)}`));
	}

	function navigateToCourseEditor(courseId: string) {
		goto(resolve(`/timetable/course-editor?courseId=${encodeURIComponent(courseId)}`));
	}
</script>

{#if screen.state.hasLoadedAppState && !screen.state.appState.currentTimetable}
	<EmptyTimetableState />
{:else if screen.state.hasLoadedAppState}
	<TimetableScreen
		{screen}
		onEditTimetableDetails={() => goto(resolve('/timetable/details'))}
		onCourseClick={navigateToCourseDetail}
		onCourseLongClick={navigateToCourseEditor}
	/>
{:else}
	<div class="flex min-h-[60vh] items-center justify-center p-4">
		<LoadingIndicator />
	</div>
{/if}
