<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { CourseEditorController } from '$lib/timetable/course-editor.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import CourseEditorForm from '$lib/components/timetable/CourseEditorForm.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import type { EdgeBarAction } from '@chronos/ui-kit';
	import { Check, DeleteFill } from '$lib/icons';

	let { editor }: { editor: CourseEditorController } = $props();

	const draft = $derived(editor.draft);

	let deleteDialogOpen = $state(false);
	const actions = $derived.by((): EdgeBarAction[] => [
		...(draft?.id
			? [
					{
						id: 'delete',
						label: hostT('course.editor.delete'),
						icon: DeleteFill,
						variant: 'danger' as const,
						onClick: () => (deleteDialogOpen = true)
					}
				]
			: []),
		{
			id: 'save',
			label: hostT('course.editor.save'),
			icon: Check,
			disabled: !editor.canSave,
			onClick: editor.save
		}
	]);

	async function confirmDelete() {
		await editor.deleteCourse();
		deleteDialogOpen = false;
	}
</script>

{#if draft}
	<FormScreenLayout {actions}>
		<CourseEditorForm {editor} />
	</FormScreenLayout>

	{#if draft.id}
		<BottomSheet
			bind:open={deleteDialogOpen}
			showHandle={false}
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
		</BottomSheet>
	{/if}
{:else}
	<p class="text-body-medium p-4 text-on-surface-variant">
		{hostT('course.editor.notFound')}
	</p>
{/if}
