<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { resolve } from '$app/paths';
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

	function handleImportClick() {
		trackEvent('empty_import_click');
	}
</script>

{#snippet deleteFooter()}
	<Button
		variant="danger"
		class="w-full"
		disabled={!currentTimetableId}
		onclick={() => (deleteDialogOpen = true)}
	>
		{hostT('timetable.manage.delete')}
	</Button>
{/snippet}

<FormScreenLayout footer={timetables.length > 0 ? deleteFooter : undefined}>
	<div class="flex flex-col gap-3">
		<h3 class="text-title-medium px-1 text-on-surface">
			{hostT('timetable.manage.heading')}
		</h3>

		{#if timetables.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 px-4 py-12 text-center"
			>
				<p class="text-body-medium text-on-surface">
					{hostT('timetable.manage.empty.title')}
				</p>
				<p class="text-body-small mt-1 text-on-surface-variant">
					{hostT('timetable.manage.empty.desc')}
				</p>
				<Button
					variant="outlined"
					class="mt-4"
					href={resolve('/transfer/import')}
					onclick={handleImportClick}
				>
					{hostT('timetable.empty.import')}
				</Button>
			</div>
		{:else}
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
		{/if}
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
