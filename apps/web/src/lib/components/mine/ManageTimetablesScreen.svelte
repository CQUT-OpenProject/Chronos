<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import SelectableOption from '$lib/components/ui/SelectableOption.svelte';

	let {
		shell
	}: {
		shell: AppShellController;
	} = $props();

	const timetables = $derived(shell.controller.timetables);
	const currentTimetableId = $derived(shell.controller.currentTimetable?.id ?? null);
	const selectedTimetable = $derived(
		timetables.find((timetable) => timetable.id === currentTimetableId) ?? null
	);

	let deleteDialogOpen = $state(false);

	async function handleSwitch(id: string) {
		trackEvent('timetable_switch');
		await shell.switchTimetable(id);
	}

	async function confirmDelete() {
		if (!currentTimetableId) return;
		trackEvent('timetable_delete');
		await shell.deleteTimetable(currentTimetableId);
		deleteDialogOpen = false;
	}
</script>

{#snippet deleteFooter()}
	<Button
		variant="danger"
		class="w-full"
		disabled={timetables.length <= 1}
		onclick={() => (deleteDialogOpen = true)}
	>
		{hostT('timetable.manage.delete')}
	</Button>
{/snippet}

<FormScreenLayout footer={deleteFooter}>
	<div class="flex flex-col gap-3">
		<h3 class="text-title-medium px-1 text-on-surface">
			{hostT('timetable.manage.heading')}
		</h3>

		<div class="flex flex-col gap-2.5">
			{#each timetables as timetable (timetable.id)}
				{@const isActive = currentTimetableId === timetable.id}
				<SelectableOption
					name="current-timetable"
					label={timetable.name}
					description={hostT('timetable.manage.courseCount', {
						count: timetable.courseCount
					})}
					selected={isActive}
					onclick={() => handleSwitch(timetable.id)}
				/>
			{/each}
		</div>
	</div>
</FormScreenLayout>

<Dialog
	bind:open={deleteDialogOpen}
	title={hostT('timetable.manage.delete.title')}
	description={selectedTimetable
		? hostT('timetable.manage.delete.descNamed', {
				name: selectedTimetable.name
			})
		: hostT('timetable.manage.delete.descGeneric')}
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
