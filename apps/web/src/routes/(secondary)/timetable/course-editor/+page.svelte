<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import CourseEditorScreen from '$lib/components/timetable/CourseEditorScreen.svelte';
	import { createCourseEditor } from '$lib/timetable/course-editor.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const shell = getContext<AppShellController>('appShell');
	const controller = getAppController();
	const courseId = $derived(page.url.searchParams.get('courseId'));

	const editor = createCourseEditor(
		shell,
		() => courseId,
		() => goto(resolve('/'))
	);

	$effect(() => {
		void courseId;
		editor.syncFromRoute();
	});
</script>

<SecondaryPageShell title={hostTextRead(controller, 'route.courseEdit')} backHref="/" flush>
	<CourseEditorScreen {editor} />
</SecondaryPageShell>
