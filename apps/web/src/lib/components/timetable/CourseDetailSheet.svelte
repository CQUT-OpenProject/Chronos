<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import CourseDetailScreen from '$lib/components/timetable/CourseDetailScreen.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import { Edit } from '$lib/icons';

	let {
		open = $bindable(false),
		courseId = $bindable<string | null>(null)
	}: {
		open?: boolean;
		courseId?: string | null;
	} = $props();

	const shell = getContext<AppShellController>('appShell');
	let bottomSheet = $state<BottomSheet | null>(null);

	const course = $derived(
		courseId
			? (shell.controller.currentTimetable?.courses.find((entry) => entry.id === courseId) ?? null)
			: null
	);

	function handleOpenChangeComplete(isOpen: boolean) {
		if (!isOpen && !open) {
			courseId = null;
		}
	}

	function editCourse() {
		if (!course) return;
		bottomSheet?.skipNextHistoryBack();
		open = false;
		trackEvent('course_editor_open', { trigger: 'detail_page' });
		goto(resolve(`/timetable/course-editor?courseId=${encodeURIComponent(course.id)}`));
	}
</script>

{#snippet editAction()}
	{#if course}
		<IconButton
			variant="standard"
			size="sm"
			ariaLabel={hostT('route.courseEditAria')}
			onclick={editCourse}
		>
			<Edit class="size-[22px]" />
		</IconButton>
	{/if}
{/snippet}

<BottomSheet
	bind:this={bottomSheet}
	bind:open
	title={hostT('route.courseDetail')}
	actions={editAction}
	onOpenChangeComplete={handleOpenChangeComplete}
>
	<div class="p-4">
		{#key courseId}
			<CourseDetailScreen {shell} {courseId} />
		{/key}
	</div>
</BottomSheet>
