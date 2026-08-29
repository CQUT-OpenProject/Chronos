<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { CourseEditorController } from '$lib/timetable/course-editor.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import CourseEditorForm from '$lib/components/timetable/CourseEditorForm.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import { getAppController } from '$lib/services/app-engine';

	let { editor }: { editor: CourseEditorController } = $props();

	const controller = getAppController();

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
					{hostT('course.editor.delete')}
				</Button>
			{/if}
			<Button
				variant="filled"
				class="w-full flex-1"
				disabled={!editor.canSave}
				onclick={editor.save}
			>
				{hostT('course.editor.save')}
			</Button>
		</div>
	{/snippet}

	<FormScreenLayout {footer}>
		<CourseEditorForm
			{draft}
			maxPeriods={editor.timetable?.academicConfig.periodTimes.length ?? 10}
		/>
	</FormScreenLayout>

	{#if draft.id}
		<Dialog
			bind:open={deleteDialogOpen}
			title={hostT('course.editor.delete.title')}
			description={hostT('course.editor.delete.desc')}
		>
			{#snippet footer()}
				<Button variant="text" onclick={() => (deleteDialogOpen = false)}>
					{hostT('common.cancel')}
				</Button>
				<Button variant="filled" onclick={confirmDelete}>
					{hostT('common.delete')}
				</Button>
			{/snippet}
		</Dialog>
	{/if}
{:else}
	<p class="text-body-medium p-4 text-on-surface-variant">
		{hostT('course.editor.notFound')}
	</p>
{/if}
