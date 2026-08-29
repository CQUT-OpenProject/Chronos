<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { TimetableDetailsController } from '$lib/timetable/timetable-details.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import TimetableDetailsEditor from '$lib/components/timetable/TimetableDetailsEditor.svelte';
	import { getAppController } from '$lib/services/app-engine';

	let {
		editor
	}: {
		editor: TimetableDetailsController;
	} = $props();

	const controller = getAppController();

	let resetDialogOpen = $state(false);

	function confirmReset() {
		editor.resetToDefaultSettings();
		resetDialogOpen = false;
	}
</script>

{#if editor.draft}
	{#snippet footer()}
		<div class="flex w-full gap-3">
			<Button variant="outlined" class="w-full flex-1" onclick={() => (resetDialogOpen = true)}>
				{hostT('timetable.details.reset')}
			</Button>
			<Button
				variant="filled"
				class="w-full flex-1"
				disabled={!editor.canSave}
				onclick={editor.save}
			>
				{hostT('timetable.details.save')}
			</Button>
		</div>
	{/snippet}

	<FormScreenLayout {footer}>
		<TimetableDetailsEditor {editor} />
	</FormScreenLayout>

	<Dialog
		bind:open={resetDialogOpen}
		title={hostT('timetable.details.reset.title')}
		description={hostT('timetable.details.reset.desc')}
	>
		{#snippet footer()}
			<Button variant="text" onclick={() => (resetDialogOpen = false)}>
				{hostT('common.cancel')}
			</Button>
			<Button variant="filled" onclick={confirmReset}>
				{hostT('common.confirm')}
			</Button>
		{/snippet}
	</Dialog>
{:else}
	<p class="text-body-medium p-4 text-on-surface-variant">
		{hostT('timetable.details.notFound')}
	</p>
{/if}
