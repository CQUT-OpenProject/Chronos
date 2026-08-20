<script lang="ts">
	import type { CourseEditorController } from '$lib/timetable/course-editor.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import CourseEditorForm from '$lib/components/timetable/CourseEditorForm.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';

	let { editor }: { editor: CourseEditorController } = $props();

	const draft = $derived(editor.draft);

	let deleteDialogOpen = $state(false);

	async function confirmDelete() {
		await editor.deleteCourse();
		deleteDialogOpen = false;
	}
</script>

{#if draft}
	{#snippet footer()}
		<div class="flex w-full gap-3">
			{#if draft.id}
				<Button variant="danger" class="w-full flex-1" onclick={() => (deleteDialogOpen = true)}>
					删除课程
				</Button>
			{/if}
			<Button
				variant="filled"
				class="w-full flex-1"
				disabled={!editor.canSave}
				onclick={editor.save}
			>
				保存
			</Button>
		</div>
	{/snippet}

	<FormScreenLayout {footer}>
		<CourseEditorForm
			{draft}
			colors={editor.coursePalette}
			maxPeriods={editor.timetable?.academicConfig.periodTimes.length ?? 10}
		/>
	</FormScreenLayout>

	{#if draft.id}
		<Dialog bind:open={deleteDialogOpen} title="删除课程？" description="删除后无法恢复。">
			{#snippet footer()}
				<Button variant="text" onclick={() => (deleteDialogOpen = false)}>取消</Button>
				<Button variant="filled" onclick={confirmDelete}>删除</Button>
			{/snippet}
		</Dialog>
	{/if}
{:else}
	<p class="m3-body-medium p-4 text-on-surface-variant">未找到课程</p>
{/if}
