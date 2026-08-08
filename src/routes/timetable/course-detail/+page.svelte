<script lang="ts">
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import CourseDetailScreen from '$lib/components/timetable/CourseDetailScreen.svelte';

	const shell = getContext<AppShellController>('appShell');
	const courseId = $derived(page.url.searchParams.get('courseId'));
</script>

<CourseDetailScreen {shell} {courseId} />
