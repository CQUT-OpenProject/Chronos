<script lang="ts">
	import type { CourseEditorController } from '$lib/timetable/course-editor.svelte';
	import CourseEditorForm from '$lib/components/timetable/CourseEditorForm.svelte';

	let { editor }: { editor: CourseEditorController } = $props();
</script>

{#if editor.draft}
	<CourseEditorForm
		draft={editor.draft}
		maxPeriods={editor.timetable?.academicConfig.periodTimes.length ?? 10}
		onDelete={editor.draft.id ? editor.deleteCourse : undefined}
	/>
{:else}
	<p class="text-sm text-on-surface-variant">未找到课程</p>
{/if}
