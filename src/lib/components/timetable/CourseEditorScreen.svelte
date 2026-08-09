<script lang="ts">
	import type { CourseEditorController } from '$lib/timetable/course-editor.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import CourseEditorForm from '$lib/components/timetable/CourseEditorForm.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';

	let { editor }: { editor: CourseEditorController } = $props();

	let deleteDialogOpen = $state(false);

	async function confirmDelete() {
		await editor.deleteCourse();
		deleteDialogOpen = false;
	}
</script>

{#if editor.draft}
	{#snippet deleteFooter()}
		<Button variant="danger" class="w-full" onclick={() => (deleteDialogOpen = true)}>
			删除课程
		</Button>
	{/snippet}

	<FormScreenLayout footer={editor.draft.id ? deleteFooter : undefined}>
		<CourseEditorForm
			draft={editor.draft}
			maxPeriods={editor.timetable?.academicConfig.periodTimes.length ?? 10}
		/>
	</FormScreenLayout>

	{#if editor.draft.id}
		<Dialog bind:open={deleteDialogOpen} title="删除课程？" description="删除后无法恢复。">
			{#snippet footer()}
				<Button variant="text" onclick={() => (deleteDialogOpen = false)}>取消</Button>
				<Button variant="filled" onclick={confirmDelete}>删除</Button>
			{/snippet}
		</Dialog>
	{/if}
{:else}
	<p class="p-4 text-sm text-on-surface-variant">未找到课程</p>
{/if}
