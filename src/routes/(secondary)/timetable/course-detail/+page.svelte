<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import CourseDetailScreen from '$lib/components/timetable/CourseDetailScreen.svelte';
	import { Edit } from '$lib/icons';

	const shell = getContext<AppShellController>('appShell');
	const courseId = $derived(page.url.searchParams.get('courseId'));

	const course = $derived(
		courseId
			? (shell.state.appState.currentTimetable?.courses.find((entry) => entry.id === courseId) ??
					null)
			: null
	);

	function editCourse() {
		if (!course) return;
		goto(resolve(`/timetable/course-editor?courseId=${encodeURIComponent(course.id)}`));
	}
</script>

{#snippet editAction()}
	{#if course}
		<button
			type="button"
			class="flex cursor-pointer items-center justify-center rounded-full p-1.5 text-on-surface hover:bg-surface-variant/50"
			aria-label="编辑课程"
			onclick={editCourse}
		>
			<Edit class="size-[22px]" />
		</button>
	{/if}
{/snippet}

<SecondaryPageShell title="课程详情" backHref="/" actions={editAction}>
	<CourseDetailScreen {shell} {courseId} />
</SecondaryPageShell>
