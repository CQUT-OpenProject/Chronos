<script lang="ts">
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

	const appState = $derived(shell.state.appState);
	const selectedTimetable = $derived(
		appState.timetables.find((timetable) => timetable.id === appState.currentTimetableId) ?? null
	);

	let deleteDialogOpen = $state(false);

	async function handleSwitch(id: string) {
		trackEvent('timetable_switch');
		await shell.services.preferences.setCurrentTimetableId(id);
	}

	async function confirmDelete() {
		if (!appState.currentTimetableId) return;
		trackEvent('timetable_delete');
		await shell.services.deleteTimetable.invoke(appState.currentTimetableId);
		deleteDialogOpen = false;
	}
</script>

{#snippet deleteFooter()}
	<Button
		variant="danger"
		class="w-full"
		disabled={appState.timetables.length <= 1}
		onclick={() => (deleteDialogOpen = true)}
	>
		删除课表
	</Button>
{/snippet}

<FormScreenLayout footer={deleteFooter}>
	<div class="flex flex-col gap-3">
		<h3 class="m3-title-medium px-1 text-on-surface">我的课表</h3>

		<div class="flex flex-col gap-2.5">
			{#each appState.timetables as timetable (timetable.id)}
				{@const isActive = appState.currentTimetableId === timetable.id}
				<SelectableOption
					name="current-timetable"
					label={timetable.name}
					description="{timetable.courseCount} 门课程"
					selected={isActive}
					onclick={() => handleSwitch(timetable.id)}
				/>
			{/each}
		</div>
	</div>
</FormScreenLayout>

<Dialog
	bind:open={deleteDialogOpen}
	title="删除课表？"
	description={selectedTimetable
		? `确定删除「${selectedTimetable.name}」吗？删除后无法恢复。`
		: '删除后无法恢复。'}
>
	{#snippet footer()}
		<Button variant="text" onclick={() => (deleteDialogOpen = false)}>取消</Button>
		<Button variant="filled" onclick={confirmDelete}>删除</Button>
	{/snippet}
</Dialog>
