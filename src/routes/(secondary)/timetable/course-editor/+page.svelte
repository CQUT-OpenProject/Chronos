<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import CourseEditorScreen from '$lib/components/timetable/CourseEditorScreen.svelte';

	const shell = getContext<AppShellController>('appShell');
	const courseId = $derived(page.url.searchParams.get('courseId'));
</script>

<CourseEditorScreen {shell} {courseId} onDone={() => goto(resolve('/'))} />
