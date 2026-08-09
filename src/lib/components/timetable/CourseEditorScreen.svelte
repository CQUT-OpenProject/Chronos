<script lang="ts">
	import type { CourseEditorController } from '$lib/timetable/course-editor.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import CourseEditorForm from '$lib/components/timetable/CourseEditorForm.svelte';

	let { editor }: { editor: CourseEditorController } = $props();

	let deleteDialogOpen = $state(false);

	async function confirmDelete() {
		await editor.deleteCourse();
		deleteDialogOpen = false;
	}
</script>

{#if editor.draft}
	<div class="flex h-full min-h-0 flex-1 flex-col">
		<div class="flex-1 overflow-y-auto p-4">
			<CourseEditorForm
				draft={editor.draft}
				maxPeriods={editor.timetable?.academicConfig.periodTimes.length ?? 10}
			/>
		</div>

		{#if editor.draft.id}
			<div class="bottom-bar">
				<Button variant="danger" class="w-full" onclick={() => (deleteDialogOpen = true)}>
					删除课程
				</Button>
			</div>
		{/if}
	</div>

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
