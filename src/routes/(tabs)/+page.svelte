<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createTimetableScreen } from '$lib/timetable/timetable-screen.svelte';
	import TimetableScreen from '$lib/components/timetable/TimetableScreen.svelte';
	import EmptyTimetableState from '$lib/components/timetable/EmptyTimetableState.svelte';

	const screen = createTimetableScreen();

	onMount(() => {
		screen.init();
		return () => screen.destroy();
	});

	function navigateToCourseDetail(courseId: string) {
		goto(resolve(`/timetable/course-detail?courseId=${encodeURIComponent(courseId)}`));
	}

	function navigateToCourseEditor(courseId: string) {
		goto(resolve(`/timetable/course-editor?courseId=${encodeURIComponent(courseId)}`));
	}
</script>

{#if screen.state.hasLoadedAppState && !screen.state.appState.currentTimetable}
	<EmptyTimetableState
		onCreateTimetable={() => screen.createTimetable()}
		onImport={() => goto(resolve('/transfer/import'))}
	/>
{:else if screen.state.hasLoadedAppState}
	<TimetableScreen
		{screen}
		onEditTimetableDetails={() => goto(resolve('/timetable/details'))}
		onCourseClick={navigateToCourseDetail}
		onCourseLongClick={navigateToCourseEditor}
	/>
{:else}
	<p class="p-4 text-center text-sm text-zinc-500">加载中…</p>
{/if}
