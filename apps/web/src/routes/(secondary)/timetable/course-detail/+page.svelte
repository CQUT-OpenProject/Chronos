<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import CourseDetailScreen from '$lib/components/timetable/CourseDetailScreen.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import { Edit } from '$lib/icons';

	const shell = getContext<AppShellController>('appShell');
	const courseId = $derived(page.url.searchParams.get('courseId'));

	const course = $derived(
		courseId
			? (shell.controller.currentTimetable?.courses.find((entry) => entry.id === courseId) ?? null)
			: null
	);

	function editCourse() {
		if (!course) return;
		trackEvent('course_editor_open', { trigger: 'detail_page' });
		goto(resolve(`/timetable/course-editor?courseId=${encodeURIComponent(course.id)}`));
	}
</script>

{#snippet editAction()}
	{#if course}
		<IconButton variant="standard" size="sm" ariaLabel="编辑课程" onclick={editCourse}>
			<Edit class="size-[22px]" />
		</IconButton>
	{/if}
{/snippet}

<SecondaryPageShell title="课程详情" backHref="/" actions={editAction}>
	<CourseDetailScreen {shell} {courseId} />
</SecondaryPageShell>
